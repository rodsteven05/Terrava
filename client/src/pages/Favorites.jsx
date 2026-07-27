import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api.js'
import MapView from '../components/MapView.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import { MapPin, Heart, ExternalLink } from 'lucide-react'

export default function Favorites() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = () => {
    setLoading(true)
    api.get('/favorites')
      .then((res) => setListings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const getBranch = (listing) => {
    if (listing.branch) return listing.branch
    const loc = (listing.location_text || '').toLowerCase()
    if (loc.includes('panabo')) return 'Panabo'
    if (loc.includes('sto. tomas') || loc.includes('sto tomas') || loc.includes('santo tomas')) return 'Sto. Tomas'
    if (loc.includes('davao city') || loc.includes('davao')) return 'Davao City'
    if (loc.includes('mati city') || loc.includes('mati')) return 'Mati City'
    if (loc.includes('digos city') || loc.includes('digos')) return 'Digos City'
    if (loc.includes('tagum')) return 'Main Tagum'
    return 'Other'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">Lands you have saved for quick access.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card border border-gray-100 h-72 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Start exploring listings and click the heart icon to save properties you like."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => navigate('/map', { state: { selectedListing: listing } })}
              className="group bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden rounded-t-2xl">
                <MapView
                  singleListing={listing}
                  height="100%"
                  dragging={false}
                  scrollWheelZoom={false}
                  zoomControl={false}
                  doubleClickZoom={false}
                />
                <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-brand-700 shadow-sm backdrop-blur-sm">
                    {getBranch(listing)}
                  </span>
                  <div className="flex items-center gap-2">
                    <FavoriteButton
                      listingId={listing.id}
                      size={18}
                      className="w-8 h-8 rounded-lg bg-white/90 shadow-sm backdrop-blur-sm items-center justify-center hover:bg-white"
                      onToggle={loadFavorites}
                    />
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600/90 text-white shadow-sm backdrop-blur-sm pointer-events-none">
                      <ExternalLink className="w-3 h-3" /> View Map
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-brand-700 transition">{listing.title}</h3>
                <p className="text-brand-600 font-bold text-lg">₱{Number(listing.price).toLocaleString()}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-lg">{listing.area_sqm} sqm</span>
                  <span className="line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0 text-brand-600" /> {listing.location_text}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Seller: {listing.seller?.full_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
