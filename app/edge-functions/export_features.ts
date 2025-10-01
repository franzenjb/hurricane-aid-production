import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  table: 'requests' | 'resources' | 'volunteers'
  format: 'csv' | 'geojson'
  ids?: string[]
  filters?: Record<string, any>
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

    // Check user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['intake_staff', 'coordinator', 'admin'].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const exportRequest: ExportRequest = await req.json()

    if (!exportRequest.table || !exportRequest.format) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let query = supabase.from(exportRequest.table).select('*')

    // Apply filters
    if (exportRequest.ids && exportRequest.ids.length > 0) {
      query = query.in('id', exportRequest.ids)
    }

    if (exportRequest.filters) {
      Object.entries(exportRequest.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query

    if (error) {
      console.error('Query error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process data to remove sensitive information for certain roles
    const processedData = data.map(item => {
      const sanitized = { ...item }
      
      // Remove PII for non-admin users
      if (userRole.role !== 'admin' && exportRequest.table === 'requests') {
        delete sanitized.phone
        delete sanitized.email
        if (sanitized.notes) {
          sanitized.notes = '[REDACTED]'
        }
      }
      
      // Convert geometry to lat/lng for easier consumption
      if (sanitized.geom && sanitized.geom.coordinates) {
        sanitized.latitude = sanitized.geom.coordinates[1]
        sanitized.longitude = sanitized.geom.coordinates[0]
      }
      
      return sanitized
    })

    let output: string
    let contentType: string
    let filename: string

    if (exportRequest.format === 'csv') {
      output = generateCSV(processedData)
      contentType = 'text/csv'
      filename = `${exportRequest.table}_export_${new Date().toISOString().split('T')[0]}.csv`
    } else {
      output = generateGeoJSON(processedData)
      contentType = 'application/json'
      filename = `${exportRequest.table}_export_${new Date().toISOString().split('T')[0]}.geojson`
    }

    // Generate signed URL (simulate - in production you'd upload to storage)
    const exportId = crypto.randomUUID()
    
    // Store export temporarily (24 hour expiry)
    // In production, you'd upload to Supabase Storage and return signed URL
    
    return new Response(
      output,
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`
        } 
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

function generateCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0]).filter(key => 
    !['geom', 'assignment', 'details', 'photos'].includes(key)
  )
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(key => {
        const value = row[key]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`
        return value
      }).join(',')
    )
  ]
  
  return csvRows.join('\n')
}

function generateGeoJSON(data: any[]): string {
  const features = data.map(item => {
    const { geom, latitude, longitude, ...properties } = item
    
    let geometry = null
    if (geom && geom.coordinates) {
      geometry = {
        type: 'Point',
        coordinates: geom.coordinates
      }
    } else if (latitude && longitude) {
      geometry = {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    }
    
    return {
      type: 'Feature',
      geometry,
      properties: {
        ...properties,
        // Clean up properties
        id: properties.id,
        created_at: properties.created_at,
        updated_at: properties.updated_at
      }
    }
  })
  
  const geoJSON = {
    type: 'FeatureCollection',
    features
  }
  
  return JSON.stringify(geoJSON, null, 2)
}