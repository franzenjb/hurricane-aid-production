import { useState } from 'react'
import { AlertTriangle, Camera, MapPin } from 'lucide-react'

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    resident_name: '',
    phone: '',
    email: '',
    address: '',
    need_type: 'food',
    priority: 'medium',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // TODO: Implement form submission
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-relief-red" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Emergency Help</h1>
              <p className="text-gray-600">Fill out this form to request assistance in Pinellas County</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="resident_name"
                value={formData.resident_name}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-relief-blue focus:ring-relief-blue"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-relief-blue focus:ring-relief-blue"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-aid-red focus:ring-aid-red"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <div className="relative">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-aid-red focus:ring-aid-red pl-10"
                placeholder="123 Main St, City, State 12345"
              />
              <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Help Needed *
              </label>
              <select
                name="need_type"
                value={formData.need_type}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-relief-blue focus:ring-relief-blue"
              >
                <option value="food">Food/Water</option>
                <option value="muck_out">Muck Out</option>
                <option value="debris">Debris Removal</option>
                <option value="medical">Medical Assistance</option>
                <option value="welfare_check">Welfare Check</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-relief-blue focus:ring-relief-blue"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-aid-red focus:ring-aid-red"
              placeholder="Please provide any additional information that would help volunteers assist you..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Upload photos to help volunteers understand the situation
              </p>
              <button
                type="button"
                className="mt-2 btn btn-secondary text-sm px-4 py-2"
              >
                Choose Files
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <p className="text-sm text-gray-600">
              * Required fields
            </p>
            <button
              type="submit"
              className="btn btn-primary px-8 py-3 text-lg"
            >
              Submit Request
            </button>
          </div>
        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your request will be reviewed by emergency response staff</li>
            <li>• A volunteer may be assigned to help based on availability</li>
            <li>• You'll be contacted using the phone number provided</li>
            <li>• Check the map for nearby resources while you wait</li>
          </ul>
        </div>
      </main>
    </div>
  )
}