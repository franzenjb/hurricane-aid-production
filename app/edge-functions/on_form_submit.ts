import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestData {
  resident_name: string
  phone: string
  email?: string
  address: string
  need_type: 'food' | 'water' | 'muck_out' | 'debris' | 'medical' | 'welfare_check' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  source?: 'self' | 'phone' | 'email' | 'import'
}

interface GeocodeResult {
  lat: number
  lng: number
  formatted_address: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData: RequestData = await req.json()

    // Validate required fields
    if (!requestData.resident_name || !requestData.phone || !requestData.address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Geocode the address
    let geom = null
    try {
      const geocoded = await geocodeAddress(requestData.address)
      if (geocoded) {
        geom = `POINT(${geocoded.lng} ${geocoded.lat})`
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }

    // Auto-assign priority based on keywords
    let priority = requestData.priority || 'medium'
    if (requestData.notes) {
      const urgentKeywords = ['medical', 'emergency', 'urgent', 'elderly', 'disabled', 'children', 'baby']
      const notes_lower = requestData.notes.toLowerCase()
      if (urgentKeywords.some(keyword => notes_lower.includes(keyword))) {
        priority = 'urgent'
      }
    }

    // Insert request into database
    const { data, error } = await supabase
      .from('requests')
      .insert({
        resident_name: requestData.resident_name,
        phone: requestData.phone,
        email: requestData.email,
        address: requestData.address,
        need_type: requestData.need_type || 'other',
        priority,
        notes: requestData.notes,
        source: requestData.source || 'self',
        geom: geom ? `ST_GeomFromText('${geom}', 4326)` : null
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for potential duplicates (optional)
    if (geom) {
      const { data: duplicates } = await supabase
        .from('requests')
        .select('id, resident_name, phone')
        .neq('id', data.id)
        .or(`phone.eq.${requestData.phone},and(email.eq.${requestData.email || 'null'})`)

      if (duplicates && duplicates.length > 0) {
        console.log(`Potential duplicate found for request ${data.id}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Request submitted successfully' 
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

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  // Try Geocodio first if API key is available
  const geocodioKey = Deno.env.get('GEOCODIO_API_KEY')
  if (geocodioKey) {
    try {
      const response = await fetch(
        `https://api.geocod.io/v1.7/geocode?q=${encodeURIComponent(address)}&api_key=${geocodioKey}&limit=1`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: result.location.lat,
          lng: result.location.lng,
          formatted_address: result.formatted_address
        }
      }
    } catch (error) {
      console.error('Geocodio error:', error)
    }
  }

  // Fallback to Nominatim (free but rate-limited)
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Hurricane-Aid-Map/1.0 (emergency-response)'
        }
      }
    )
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formatted_address: result.display_name
      }
    }
  } catch (error) {
    console.error('Nominatim error:', error)
  }

  return null
}