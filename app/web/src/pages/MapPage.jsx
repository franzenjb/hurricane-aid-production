import { useState, useEffect } from 'react'
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/maplibre'
import { supabase } from '../lib/supabase'

export default function MapPage() {
  const [viewState, setViewState] = useState({
    longitude: -80.1918,
    latitude: 25.7617, // Miami area default
    zoom: 10
  })
  const [resources, setResources] = useState([])
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    fetchPublicResources()
  }, [])

  const fetchPublicResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, name, resource_type, status, hours, geom')
        .eq('status', 'open')

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
    }
  }

  const getResourceColor = (type) => {
    switch (type) {
      case 'shelter': return '#dc2626'
      case 'kitchen': return '#059669'
      case 'equipment': return '#2563eb'
      case 'water': return '#0891b2'
      case 'food': return '#ea580c'
      default: return '#6b7280'
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Emergency Resources Map</h1>
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
        </div>
      </header>

      <div className="flex-1 relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{width: '100%', height: '100%'}}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          {resources.map((resource) => {
            if (!resource.geom?.coordinates) return null
            
            const [lng, lat] = resource.geom.coordinates
            
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

          {selectedResource && (
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