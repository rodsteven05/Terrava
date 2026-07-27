import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api.js'
import MapView from '../components/MapView.jsx'
import Spinner from '../components/Spinner.jsx'
import { SkeletonCard } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Search, Plus, MapPin, Scale, ExternalLink, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [compareIds, setCompareIds] = useState(() => JSON.parse(localStorage.getItem('compareIds') || '[]'))
  const [branch, setBranch] = useState('all')

  useEffect(() => {
    setLoading(true)
    api.get('/listings')
      .then((res) => setListings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const toggleCompare = (id) => {
    const next = compareIds.includes(id)
      ? compareIds.filter((x) => x !== id)
      : compareIds.length < 3 ? [...compareIds, id] : compareIds
    setCompareIds(next)
    localStorage.setItem('compareIds', JSON.stringify(next))
  }

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

  const available = listings.filter((l) => l.status === 'available')
  const filtered = available.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.location_text || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.branch || '').toLowerCase().includes(search.toLowerCase())
    const matchesBranch = branch === 'all' || getBranch(l) === branch
    return matchesSearch && matchesBranch
  })
  const BRANCHES = ['Main Tagum', 'Panabo', 'Sto. Tomas', 'Davao City', 'Mati City', 'Digos City']
  const grouped = Object.fromEntries(
    BRANCHES.map((b) => [b, available.filter((l) => getBranch(l) === b)])
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Explore Land Listings</h1>
          <p className="text-gray-600 mt-1">Browse verified properties with GIS maps and blockchain-backed records.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {user && (
            <Link to="/compare" className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 border border-brand-200 px-4 py-2 rounded-lg hover:bg-brand-50 transition shadow-sm">
              <Scale className="w-4 h-4" /> Compare ({compareIds.length})
            </Link>
          )}
          {(!user || user.role === 'seller' || user.role === 'admin') && (
            <Link to="/create-listing" className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm">
              <Plus className="w-4 h-4" /> Post a Listing
            </Link>
          )}
        </div>
      </div>

      <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-card">
        <MapView listings={filtered} height="100%" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Branches ({available.length})</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b} ({grouped[b].length})</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <EmptyState title="No listings found" message="Try adjusting your search or be the first to post a property." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((listing) => (
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
                  {user && (
                    <div className="px-5 pb-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCompare(listing.id) }}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition ${compareIds.includes(listing.id) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'}`}
                      >
                        {compareIds.includes(listing.id) ? 'Added to Compare' : 'Compare'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
