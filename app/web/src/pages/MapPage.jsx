import { useState, useEffect } from 'react'
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/maplibre'
import { supabase } from '../lib/supabase'
import { mockResources } from '../lib/mockData'

export default function MapPage() {
  const [viewState, setViewState] = useState({
    longitude: -82.7037,
    latitude: 27.8661, // Pinellas County, Florida
    zoom: 11
  })
  const [resources, setResources] = useState([])
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    // Load demo data
    fetchPublicResources()
  }, [])

  const fetchPublicResources = async () => {
    // Skip Supabase for demo - use mock data directly
    console.log('Using mock data for demo')
    setResources(getMockResources())
    
    // Uncomment below when Supabase is properly configured:
    /*
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, name, resource_type, status, hours, geom')
        .eq('status', 'open')

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
      setResources(getMockResources())
    }
    */
  }

  const getMockResources = () => {
    // Convert mockResources to map format
    return mockResources.map(resource => ({
      ...resource,
      geom: { 
        coordinates: [
          // Coordinates for Pinellas County locations
          resource.id === '1' ? [-82.6404, 27.7676] : // St. Petersburg
          resource.id === '2' ? [-82.8001, 27.9659] : // Clearwater  
          resource.id === '3' ? [-82.6995, 27.8428] : // Pinellas Park
          resource.id === '4' ? [-82.7873, 27.9095] : // Largo
          resource.id === '5' ? [-82.7693, 27.7664] : // Treasure Island
          [-82.7937, 27.8387] // Seminole
        ]
      }
    }))
  }

  const getResourceColor = (type) => {
    switch (type) {
      case 'shelter': return '#dc2626'
      case 'kitchen': return '#059669'
      case 'food': return '#059669'
      case 'equipment': return '#2563eb'
      case 'water': return '#0891b2'
      case 'charging': return '#ea580c'
      case 'wifi': return '#9333ea'
      default: return '#6b7280'
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Pinellas County Emergency Resources</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Shelters</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Food</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Equipment</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
            <span>Water</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>Charging</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onError={(error) => console.error('Map error:', error)}
          style={{width: '100%', height: '100%'}}
          mapStyle={{
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm',
                type: 'raster',
                source: 'osm'
              }
            ]
          }}
        >
          {resources.map((resource) => {
            if (!resource.geom?.coordinates) return null
            
            const [lng, lat] = resource.geom.coordinates
            
            // Skip invalid coordinates
            if (isNaN(lng) || isNaN(lat)) return null
            
            return (
              <Marker
                key={resource.id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  setSelectedResource(resource)
                }}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: getResourceColor(resource.resource_type) }}
                />
              </Marker>
            )
          })}

          {selectedResource && selectedResource.geom?.coordinates && (
            <Popup
              longitude={selectedResource.geom.coordinates[0]}
              latitude={selectedResource.geom.coordinates[1]}
              anchor="top"
              onClose={() => setSelectedResource(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-3 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {selectedResource.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 capitalize">
                  {selectedResource.resource_type.replace('_', ' ')}
                </p>
                {selectedResource.hours && (
                  <p className="text-sm text-gray-600">
                    Hours: {selectedResource.hours}
                  </p>
                )}
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedResource.status === 'open' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedResource.status}
                  </span>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Available Resources</h3>
          <p className="text-sm text-gray-600 mb-3">
            Click on map markers to see details about emergency resources in your area.
          </p>
          <div className="text-xs text-gray-500">
            Showing {resources.length} open resources
          </div>
        </div>
      </div>
    </div>
  )
}