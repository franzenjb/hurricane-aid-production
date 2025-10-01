import { useState } from 'react'
import { Users, MapPin, AlertTriangle, Download, Clock, CheckCircle, XCircle } from 'lucide-react'
import { mockRequests, mockVolunteers, mockResources, mockAlerts } from '../lib/mockData'
import { getPriorityColor, getStatusColor, formatDate } from '../lib/utils'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('requests')

  const tabs = [
    { id: 'requests', label: 'Requests', icon: AlertTriangle },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'resources', label: 'Resources', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'exports', label: 'Exports', icon: Download }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Pinellas County Emergency Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="btn btn-primary px-4 py-2">
                Send Alert
              </button>
              <button className="btn btn-secondary px-4 py-2">
                Add Resource
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-relief-blue text-relief-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Help Requests ({mockRequests.length})</h2>
                <div className="flex space-x-2">
                  <select className="rounded-md border-gray-300 text-sm">
                    <option>All Types</option>
                    <option>Food/Water</option>
                    <option>Muck Out</option>
                    <option>Debris</option>
                    <option>Medical</option>
                  </select>
                  <select className="rounded-md border-gray-300 text-sm">
                    <option>All Status</option>
                    <option>New</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Need</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.resident_name}</div>
                            <div className="text-sm text-gray-500">{request.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{request.need_type.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{request.notes}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.assignment ? request.assignment.volunteer_name : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Volunteers ({mockVolunteers.length})</h2>
                <button className="btn btn-primary px-4 py-2">
                  Add Volunteer
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockVolunteers.map((volunteer) => (
                  <div key={volunteer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{volunteer.full_name}</h3>
                        <p className="text-sm text-gray-600">{volunteer.email}</p>
                        <p className="text-sm text-gray-600">{volunteer.phone}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        volunteer.availability === 'now' ? 'bg-green-100 text-green-800' :
                        volunteer.availability === 'today' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {volunteer.availability}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Base: {volunteer.home_base}</p>
                      <p className="text-sm text-gray-600 mb-2">Skills: {volunteer.skills.join(', ')}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active: {volunteer.active_requests}</span>
                      <span className="text-gray-600">Completed: {volunteer.total_completed}</span>
                      <span className={`${volunteer.opt_in_alerts ? 'text-green-600' : 'text-gray-400'}`}>
                        {volunteer.opt_in_alerts ? '🔔' : '🔕'} Alerts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Emergency Resources ({mockResources.length})</h2>
                <button className="btn btn-primary px-4 py-2">
                  Add Resource
                </button>
              </div>
              <div className="space-y-4">
                {mockResources.map((resource) => (
                  <div key={resource.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{resource.name}</h3>
                          <span className="text-xs text-gray-500 capitalize">{resource.resource_type}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            resource.status === 'open' ? 'bg-green-100 text-green-800' :
                            resource.status === 'full' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {resource.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Hours:</strong> {resource.hours}</p>
                            <p><strong>Contact:</strong> {resource.contact_phone}</p>
                          </div>
                          <div>
                            {resource.capacity && (
                              <p><strong>Capacity:</strong> {resource.current_occupancy || 0}/{resource.capacity}</p>
                            )}
                            <p><strong>Address:</strong> {resource.address}</p>
                          </div>
                          <div>
                            {Object.keys(resource.details).length > 0 && (
                              <p><strong>Features:</strong> {Object.keys(resource.details).join(', ')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Emergency Alerts ({mockAlerts.length})</h2>
                <button className="btn btn-primary px-4 py-2">
                  Create Alert
                </button>
              </div>
              <div className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.alert_type === 'safety' ? 'bg-red-100 text-red-800' :
                            alert.alert_type === 'resource_opened' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {alert.alert_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{alert.message}</p>
                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Radius:</strong> {alert.radius_km} km</p>
                          </div>
                          <div>
                            <p><strong>Audience:</strong> {alert.audience}</p>
                          </div>
                          <div>
                            <p><strong>Channel:</strong> {alert.dispatch_channel}</p>
                          </div>
                          <div>
                            <p><strong>Recipients:</strong> {alert.recipients_count}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{formatDate(alert.dispatched_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Data Exports</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Request Data</h3>
                  <p className="text-sm text-gray-600 mb-3">Export all help requests as CSV or GeoJSON</p>
                  <div className="flex space-x-2">
                    <button className="btn btn-secondary text-sm px-3 py-1">CSV</button>
                    <button className="btn btn-secondary text-sm px-3 py-1">GeoJSON</button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Resource Data</h3>
                  <p className="text-sm text-gray-600 mb-3">Export resource locations and status</p>
                  <div className="flex space-x-2">
                    <button className="btn btn-secondary text-sm px-3 py-1">CSV</button>
                    <button className="btn btn-secondary text-sm px-3 py-1">GeoJSON</button>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Red Cross Notification</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Generate email with current situation report and data exports
                </p>
                <button className="btn btn-primary px-4 py-2">
                  Prepare ARC Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}