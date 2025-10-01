import { useState } from 'react'
import { Users, MapPin, AlertTriangle, Download } from 'lucide-react'

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
                      ? 'border-aid-red text-aid-red'
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
                <h2 className="text-lg font-medium text-gray-900">Help Requests</h2>
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
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No help requests found.</p>
                <p className="text-sm mt-1">Requests will appear here once submitted through the form.</p>
              </div>
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Volunteers</h2>
                <button className="btn btn-primary px-4 py-2">
                  Add Volunteer
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No volunteers registered.</p>
                <p className="text-sm mt-1">Volunteers will appear here once they sign up.</p>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Resources</h2>
                <button className="btn btn-primary px-4 py-2">
                  Add Resource
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No resources added.</p>
                <p className="text-sm mt-1">Add shelters, food kitchens, and other resources.</p>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Emergency Alerts</h2>
                <button className="btn btn-primary px-4 py-2">
                  Create Alert
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No alerts sent.</p>
                <p className="text-sm mt-1">Send radius-based alerts to volunteers and residents.</p>
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