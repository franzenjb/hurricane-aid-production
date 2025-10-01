import { Link } from 'react-router-dom'
import { MapPin, Users, AlertTriangle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-aid-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">Hurricane & Flood Aid Map</h1>
          <p className="mt-2 text-red-100">Community response coordination platform</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Help. Give Help. Stay Connected.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect residents, volunteers, and resources during hurricane and flood emergencies.
            Request assistance, find nearby aid, or volunteer to help your community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-aid-red mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Help</h3>
            <p className="text-gray-600 mb-4">
              Need food, water, debris removal, or other assistance? Submit a request and connect with volunteers.
            </p>
            <Link to="/submit" className="btn btn-primary px-6 py-3">
              Request Help
            </Link>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <MapPin className="h-12 w-12 text-aid-red mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Find Nearby Aid</h3>
            <p className="text-gray-600 mb-4">
              Locate open shelters, food kitchens, supply drops, and other emergency resources near you.
            </p>
            <Link to="/map" className="btn btn-primary px-6 py-3">
              View Map
            </Link>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 text-aid-red mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Volunteer</h3>
            <p className="text-gray-600 mb-4">
              Help your neighbors by volunteering for muck-outs, debris removal, and other recovery efforts.
            </p>
            <Link to="/login" className="btn btn-primary px-6 py-3">
              Volunteer
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-aid-red hover:text-aid-red/80 font-medium">
            Emergency Response Staff Login →
          </Link>
        </div>
      </main>
    </div>
  )
}