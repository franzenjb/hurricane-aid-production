import { useState, useEffect, useRef } from 'react'
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/maplibre'
import { supabase } from '../lib/supabase'
import { mockResources } from '../lib/mockData'
import { Edit, Square, Trash2 } from 'lucide-react'

export default function MapPage() {
  const [viewState, setViewState] = useState({
    longitude: -82.7037,
    latitude: 27.8661, // Pinellas County, Florida
    zoom: 11
  })
  const [resources, setResources] = useState([])
  const [selectedResource, setSelectedResource] = useState(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [polygons, setPolygons] = useState([])
  const [currentPolygon, setCurrentPolygon] = useState(null)
  const mapRef = useRef(null)

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
    // Convert mockResources to map format with precise coordinates
    const resourceCoordinates = {
      '1': [-82.6404, 27.7676], // St. Petersburg Emergency Shelter
      '2': [-82.7937, 27.8387], // Seminole High School Shelter
      '3': [-82.8001, 27.9659], // Clearwater Red Cross Shelter
      '4': [-82.8001, 27.9659], // Clearwater Community Kitchen
      '5': [-82.6404, 27.7376], // St. Pete Food Bank
      '6': [-82.7873, 27.9095], // Largo Emergency Food Distribution
      '7': [-82.7873, 27.9095], // Largo Water Distribution
      '8': [-82.7726, 28.0197], // Dunedin Water Point
      '9': [-82.6995, 27.8428], // Pinellas Park Equipment Center
      '10': [-82.8001, 27.9459], // Belcher Elementary Supply Drop
      '11': [-82.8493, 27.8881], // Indian Rocks Beach Charging Station
      '12': [-82.6926, 27.7981], // Safety Harbor Library Charging
      '13': [-82.7568, 28.1461], // Mobile Medical Unit - Tarpon Springs
      '14': [-82.7873, 27.8895] // Emergency Pet Shelter
    }
    
    return mockResources.map(resource => ({
      ...resource,
      geom: { 
        coordinates: resourceCoordinates[resource.id] || [-82.7037, 27.8661]
      }
    }))
  }

  const getResourceColor = (type) => {
    switch (type) {
      case 'shelter': return '#dc2626' // Red
      case 'food': return '#059669' // Green
      case 'water': return '#0891b2' // Cyan
      case 'equipment': return '#2563eb' // Blue
      case 'charging': return '#ea580c' // Orange
      case 'medical': return '#7c3aed' // Purple
      case 'pet_shelter': return '#db2777' // Pink
      default: return '#6b7280' // Gray
    }
  }

  const handleMapClick = (event) => {
    if (!drawingMode) return
    
    const { lng, lat } = event.lngLat
    
    if (!currentPolygon) {
      // Start new polygon
      setCurrentPolygon({
        id: Date.now(),
        type: 'flood_zone',
        coordinates: [[lng, lat]],
        name: `Area ${polygons.length + 1}`
      })
    } else {
      // Add point to current polygon
      setCurrentPolygon(prev => ({
        ...prev,
        coordinates: [...prev.coordinates, [lng, lat]]
      }))
    }
  }

  const finishPolygon = () => {
    if (currentPolygon && currentPolygon.coordinates.length >= 3) {
      // Close the polygon by adding the first point at the end
      const closedPolygon = {
        ...currentPolygon,
        coordinates: [...currentPolygon.coordinates, currentPolygon.coordinates[0]]
      }
      setPolygons(prev => [...prev, closedPolygon])
      setCurrentPolygon(null)
      setDrawingMode(false)
    }
  }

  const cancelDrawing = () => {
    setCurrentPolygon(null)
    setDrawingMode(false)
  }

  const clearAllPolygons = () => {
    setPolygons([])
    setCurrentPolygon(null)
    setDrawingMode(false)
  }

  const getPolygonGeoJSON = () => {
    const features = polygons.map(polygon => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygon.coordinates]
      },
      properties: {
        id: polygon.id,
        name: polygon.name,
        type: polygon.type
      }
    }))
    
    if (currentPolygon && currentPolygon.coordinates.length > 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [currentPolygon.coordinates]
        },
        properties: {
          id: 'current',
          name: 'Drawing...',
          type: 'current'
        }
      })
    }
    
    return {
      type: 'FeatureCollection',
      features
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-900">Pinellas County Emergency Resources</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDrawingMode(!drawingMode)}
              className={`px-3 py-1 rounded text-sm font-medium flex items-center space-x-1 ${
                drawingMode ? 'bg-relief-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Square className="h-4 w-4" />
              <span>{drawingMode ? 'Cancel Drawing' : 'Draw Area'}</span>
            </button>
            {currentPolygon && (
              <button
                onClick={finishPolygon}
                className="px-3 py-1 bg-relief-blue text-white rounded text-sm font-medium hover:bg-relief-blue/90"
              >
                Finish Area
              </button>
            )}
            {polygons.length > 0 && (
              <button
                onClick={clearAllPolygons}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm font-medium hover:bg-gray-600 flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Shelters</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Food</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
            <span>Water</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Equipment</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>Charging</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span>Medical</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
            <span>Pets</span>
          </div>
        </div>
        {drawingMode && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800 mt-2">
            <strong>Drawing Mode:</strong> Click on the map to add points for flood zones or focus areas. Click "Finish Area" when done.
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
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
          {/* Polygon layers for drawn areas */}
          {(polygons.length > 0 || currentPolygon) && (
            <Source id="polygons" type="geojson" data={getPolygonGeoJSON()}>
              <Layer
                id="polygon-fill"
                type="fill"
                paint={{
                  'fill-color': [
                    'case',
                    ['==', ['get', 'type'], 'current'],
                    '#3b82f6',
                    '#ef4444'
                  ],
                  'fill-opacity': 0.3
                }}
              />
              <Layer
                id="polygon-stroke"
                type="line"
                paint={{
                  'line-color': [
                    'case',
                    ['==', ['get', 'type'], 'current'],
                    '#1d4ed8',
                    '#dc2626'
                  ],
                  'line-width': 2
                }}
              />
            </Source>
          )}

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