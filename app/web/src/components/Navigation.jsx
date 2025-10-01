import { Link, useLocation } from 'react-router-dom'
import { Home, Map, Users, FileText, LogIn } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Emergency Map', icon: Map },
    { path: '/submit', label: 'Request Help', icon: FileText },
    { path: '/dashboard', label: 'Dashboard', icon: Users },
    { path: '/login', label: 'Login', icon: LogIn }
  ]

  return (
    <nav className="bg-relief-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="./show-up-logo.webp" 
              alt="Show Up Relief Alliance" 
              className="h-8 w-auto"
            />
            <div className="text-sm">
              <div className="font-bold">Pinellas County</div>
              <div className="text-xs text-blue-200">Emergency Response</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-relief-blue text-white'
                      : 'text-blue-100 hover:bg-relief-blue hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-red-100 hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-red-700 text-white'
                      : 'text-red-100 hover:bg-red-600 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}