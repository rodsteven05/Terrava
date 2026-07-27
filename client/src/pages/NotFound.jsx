import { Link } from 'react-router-dom'
import { MapPin, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-brand-100 p-4 rounded-2xl mb-6">
        <MapPin className="w-12 h-12 text-brand-600" />
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-1">Page Not Found</p>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition font-semibold shadow-sm"
      >
        <Home className="w-5 h-5" /> Go Home
      </Link>
    </div>
  )
}
