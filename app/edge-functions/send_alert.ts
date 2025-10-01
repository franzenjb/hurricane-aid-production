import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertRequest {
  alert_type: 'resource_opened' | 'resource_closed' | 'safety' | 'update'
  title: string
  message: string
  radius_km: number
  origin: {
    lat: number
    lng: number
  }
  audience: 'residents' | 'volunteers' | 'both'
  dispatch_channel: 'email' | 'sms' | 'both'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check authentication
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user role (only coordinators/admins can send alerts)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['coordinator', 'admin'].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const alertData: AlertRequest = await req.json()

    // Validate required fields
    if (!alertData.title || !alertData.message || !alertData.origin) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the alert record
    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .insert({
        alert_type: alertData.alert_type,
        title: alertData.title,
        message: alertData.message,
        radius_km: alertData.radius_km || 3,
        origin: `POINT(${alertData.origin.lng} ${alertData.origin.lat})`,
        audience: alertData.audience || 'both',
        dispatch_channel: alertData.dispatch_channel || 'email',
        dispatched_at: new Date().toISOString()
      })
      .select()
      .single()

    if (alertError) {
      console.error('Alert creation error:', alertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create alert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find recipients within radius
    const radiusMeters = (alertData.radius_km || 3) * 1000
    
    const { data: recipients, error: recipientsError } = await supabase
      .rpc('find_recipients_in_radius', {
        origin_point: `POINT(${alertData.origin.lng} ${alertData.origin.lat})`,
        radius_meters: radiusMeters,
        target_audience: alertData.audience || 'both'
      })

    if (recipientsError) {
      console.error('Recipients query error:', recipientsError)
      return new Response(
        JSON.stringify({ error: 'Failed to find recipients' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send emails if enabled
    let emailCount = 0
    if (['email', 'both'].includes(alertData.dispatch_channel)) {
      for (const recipient of recipients || []) {
        if (recipient.email) {
          try {
            await sendEmail(recipient.email, alertData.title, alertData.message)
            emailCount++
          } catch (error) {
            console.error(`Failed to send email to ${recipient.email}:`, error)
          }
        }
      }
    }

    // SMS functionality would go here if Twilio is configured
    let smsCount = 0
    if (['sms', 'both'].includes(alertData.dispatch_channel)) {
      // TODO: Implement SMS sending with Twilio
      console.log('SMS sending not implemented yet')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        alert_id: alert.id,
        recipients_found: recipients?.length || 0,
        emails_sent: emailCount,
        sms_sent: smsCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendEmail(to: string, subject: string, message: string): Promise<void> {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const sendgridKey = Deno.env.get('SENDGRID_API_KEY')

  if (resendKey) {
    // Use Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'alerts@emergency-aid.org',
        to: [to],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Emergency Alert</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #dc2626; margin-top: 0;">${subject}</h2>
              <p style="font-size: 16px; line-height: 1.5;">${message}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>This is an official emergency alert.</strong> 
                  Reply STOP to unsubscribe from future alerts.
                </p>
              </div>
            </div>
          </div>
        `
      }),
    })

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`)
    }
  } else if (sendgridKey) {
    // Use SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject
        }],
        from: { email: 'alerts@emergency-aid.org', name: 'Emergency Aid System' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Emergency Alert</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #dc2626; margin-top: 0;">${subject}</h2>
                <p style="font-size: 16px; line-height: 1.5;">${message}</p>
                <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-size: 14px;">
                    <strong>This is an official emergency alert.</strong> 
                    Reply STOP to unsubscribe from future alerts.
                  </p>
                </div>
              </div>
            </div>
          `
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`)
    }
  } else {
    throw new Error('No email service configured')
  }
}