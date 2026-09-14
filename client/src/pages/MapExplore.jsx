import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/api.js'
import MapView from '../components/MapView.jsx'
import Spinner from '../components/Spinner.jsx'
import { ChevronDown, ChevronUp, MapPin, Maximize, Tag, X, Eye, MessageCircle, Building2, Search, Home, SlidersHorizontal, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import PesoIcon from '../components/PesoIcon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import LandDetailsModal from '../components/LandDetailsModal.jsx'
import MessageSellerModal from '../components/MessageSellerModal.jsx'
import { BRANCHES, getBranch } from '../utils/branches.js'

export default function MapExplore() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [flyTo, setFlyTo] = useState(null)
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [activeBranch, setActiveBranch] = useState('all')
  const [panelOpen, setPanelOpen] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [preferredBranch, setPreferredBranch] = useState('Main Tagum')
  const [search, setSearch] = useState('')
  const [branchGuideOpen, setBranchGuideOpen] = useState(false)
  const [branchInfoOpen, setBranchInfoOpen] = useState(false)

  useEffect(() => {
    api.get('/listings')
      .then((res) => {
        const available = res.data.filter((l) => l.status === 'available')
        setListings(available)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const b = params.get('branch')
    if (b && BRANCHES.includes(b)) {
      setActiveBranch(b)
      setExpanded(b)
      setFlyTo({ branch: b })
    }
  }, [location.search])

  const BRANCH_COLORS = {
    'Main Tagum': { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-800', badge: 'bg-emerald-200 text-emerald-800', border: 'border-emerald-100' },
    'Panabo': { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-200 text-blue-800', border: 'border-blue-100' },
    'Sto. Tomas': { bg: 'bg-violet-50', hover: 'hover:bg-violet-100', text: 'text-violet-800', badge: 'bg-violet-200 text-violet-800', border: 'border-violet-100' },
    'Davao City': { bg: 'bg-amber-50', hover: 'hover:bg-amber-100', text: 'text-amber-800', badge: 'bg-amber-200 text-amber-800', border: 'border-amber-100' },
    'Mati City': { bg: 'bg-pink-50', hover: 'hover:bg-pink-100', text: 'text-pink-800', badge: 'bg-pink-200 text-pink-800', border: 'border-pink-100' },
    'Digos City': { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-800', badge: 'bg-indigo-200 text-indigo-800', border: 'border-indigo-100' },
  }

  const branchStyle = (branch) => BRANCH_COLORS[branch] || BRANCH_COLORS['Main Tagum']

  const branchFiltered = activeBranch === 'all'
    ? listings
    : listings.filter((l) => getBranch(l) === activeBranch)

  const filteredListings = branchFiltered.filter((l) => {
    const q = search.toLowerCase()
    return !q ||
      (l.title || '').toLowerCase().includes(q) ||
      (l.location_text || '').toLowerCase().includes(q)
  })

  const grouped = filteredListings.reduce((acc, l) => {
    const b = getBranch(l)
    if (!acc[b]) acc[b] = []
    acc[b].push(l)
    return acc
  }, {})

  const handleSelect = (listing) => {
    setSelected(listing)
    setFlyTo(listing)
    setExpanded(getBranch(listing))
    setPanelOpen(true)
    if (user?.role?.toLowerCase() === 'buyer') {
      setBranchGuideOpen(true)
    }
  }

  const handleMapSelect = (listing) => {
    handleSelect(listing)
  }

  useEffect(() => {
    const preselected = location.state?.selectedListing
    if (preselected && listings.length > 0) {
      const match = listings.find((l) => l.id === preselected.id)
      if (match) {
        handleSelect(match)
        window.history.replaceState({}, document.title)
      }
    }
  }, [listings, location.state])

  useEffect(() => {
    if (selected) setPreferredBranch(getBranch(selected))
  }, [selected])

  useEffect(() => {
    if (!lightboxOpen) return
    const photos = selected?.photos || []
    if (photos.length === 0) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % photos.length)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, selected])

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen overflow-hidden relative">

      {/* Left panel — listing accordion */}
      <div className={`flex-shrink-0 bg-gray-50 border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 z-20 ${
        panelOpen ? 'w-80' : 'w-0 overflow-hidden'
      }`}>
        {/* Gradient header */}
        <div className="p-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Land Listings</h2>
            <p className="text-xs text-white/70 mt-0.5">{filteredListings.length} available properties</p>
          </div>
          <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition text-white/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Branch filter + search */}
        <div className="p-4 border-b border-gray-200 bg-white space-y-3">
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={activeBranch}
              onChange={(e) => {
                const b = e.target.value
                setActiveBranch(b)
                setExpanded(b === 'all' ? null : b)
                setFlyTo(b === 'all' ? null : { branch: b })
                if (b !== 'all') navigate({ search: `?branch=${encodeURIComponent(b)}` }, { replace: true })
                else navigate({ search: '' }, { replace: true })
              }}
              className="w-full appearance-none pl-10 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition shadow-sm cursor-pointer"
            >
              <option value="all">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or location..."
              className="w-full pl-10 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 text-gray-400 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Accordion list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(grouped).length === 0 ? (
            <div className="text-center py-10">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No properties match your search.</p>
              <p className="text-xs text-gray-400 mt-1">Try a different keyword.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([branch, items]) => {
              const style = branchStyle(branch)
              const isExpanded = expanded === branch || search
              return (
                <div key={branch} className={`rounded-xl border ${style.border} overflow-hidden bg-white shadow-sm`}>
                  <button
                    onClick={() => setExpanded(expanded === branch ? null : branch)}
                    className={`w-full flex items-center justify-between px-4 py-3 ${style.bg} ${style.hover} transition text-sm font-bold ${style.text}`}
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> {branch}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${style.badge} px-2.5 py-1 rounded-full`}>{items.length}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-2 space-y-2">
                      {items.map((l) => {
                        const isActive = selected?.id === l.id
                        return (
                          <div
                            key={l.id}
                            className={`relative rounded-xl transition overflow-hidden ${
                              isActive
                                ? 'bg-brand-600 text-white shadow-md'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
                            }`}
                          >
                            <button onClick={() => handleSelect(l)} className="w-full text-left">
                              <div className="flex gap-3 p-3">
                                {l.photos?.[0] ? (
                                  <img src={l.photos[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                  <div className={`w-14 h-14 rounded-lg ${isActive ? 'bg-white/20' : 'bg-brand-50'} flex items-center justify-center flex-shrink-0`}>
                                    <Home className={`w-6 h-6 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm line-clamp-1 pr-6">{l.title}</p>
                                  <p className={`text-xs mt-0.5 flex items-center gap-1 ${isActive ? 'text-brand-200' : 'text-gray-400'}`}>
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="line-clamp-1">{l.location_text}</span>
                                  </p>
                                  <div className={`flex items-center gap-2 mt-1.5 text-xs ${isActive ? 'text-brand-100' : 'text-gray-500'}`}>
                                    <PesoIcon className="w-3 h-3" />
                                    <span className="font-bold">₱{Number(l.price).toLocaleString()}</span>
                                    <span className="text-[10px]">•</span>
                                    <Maximize className="w-3 h-3" />
                                    <span>{l.area_sqm} sqm</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                            <div className="absolute top-2 right-2">
                              <FavoriteButton
                                listingId={l.id}
                                size={18}
                                className={`w-7 h-7 rounded-lg items-center justify-center transition ${
                                  isActive ? 'hover:bg-white/20' : 'hover:bg-gray-100'
                                }`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Toggle panel button */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-brand-600 text-white px-2 py-4 rounded-r-xl shadow-lg hover:bg-brand-700 transition flex items-center gap-1"
          title="Show listings panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      )}

      {/* Map fills remaining space */}
      <div className="flex-1 relative">
        <MapView listings={filteredListings} height="100%" flyTo={flyTo} onSelectListing={handleMapSelect} selectedListingId={selected?.id} />

        {/* Compact selected listing card */}
        {selected && (
          <div className="absolute bottom-3 left-3 right-3 md:left-4 md:right-auto md:w-[22rem] bg-white/95 backdrop-blur border border-gray-200/80 shadow-2xl rounded-2xl p-4 z-20 max-h-[70vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-emerald-500 rounded-t-2xl" />

            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize">
                    <Building2 className="w-3 h-3" /> {getBranch(selected)}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{selected.title}</h3>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-brand-600" /> {selected.location_text}
                </p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <FavoriteButton listingId={selected.id} size={18} className="p-1" />
                <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100 overflow-hidden">
                <PesoIcon className="w-3.5 h-3.5 text-brand-600 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Price</p>
                <p className="text-[10px] font-bold text-gray-900 truncate">₱{Number(selected.price).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                <Maximize className="w-3.5 h-3.5 text-brand-600 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Area</p>
                <p className="text-xs font-bold text-gray-900">{Number(selected.area_sqm).toLocaleString()}m²</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                <Tag className="w-3.5 h-3.5 text-brand-600 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Status</p>
                <p className="text-xs font-bold text-gray-900 capitalize">{selected.status}</p>
              </div>
            </div>

            {selected.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{selected.description}</p>
            )}

            {/* Photo gallery — scrollable thumbnails */}
            {selected.photos?.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Property Photos
                  </h4>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    {selected.photos.length}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {selected.photos.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true) }}
                      className="relative flex-shrink-0 w-16 h-16 rounded-lg border border-gray-200 overflow-hidden group hover:border-emerald-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover transition group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {user?.role === 'buyer' && (
                <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                    <span className="text-[10px] font-medium text-gray-600">Meet at:</span>
                  </div>
                  <select
                    value={preferredBranch}
                    onChange={(e) => setPreferredBranch(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer text-right"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                {user?.role === 'buyer' && (
                  <button
                    type="button"
                    onClick={() => setMessageOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-xs shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Message
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition font-semibold text-xs shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded photo lightbox */}
        {lightboxOpen && selected?.photos?.length > 0 && (
          <div
            className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="relative max-w-5xl w-full max-h-screen flex flex-col items-center">
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition z-10"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              {selected.photos.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + selected.photos.length) % selected.photos.length) }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <img
                src={selected.photos[lightboxIndex]}
                alt={`Property ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              {selected.photos.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % selected.photos.length) }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              <div className="mt-4 flex items-center gap-2 text-white/80 text-sm">
                <span className="font-medium">{lightboxIndex + 1}</span>
                <span>/</span>
                <span>{selected.photos.length}</span>
              </div>
            </div>
          </div>
        )}

        {branchGuideOpen && selected && user?.role?.toLowerCase() === 'buyer' && (
          <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white border border-emerald-100 shadow-2xl rounded-2xl p-4 z-[1100] animate-fadeIn pointer-events-auto" style={{ zIndex: 1100 }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">Visit our nearest branch</h4>
                  <button
                    onClick={() => setBranchGuideOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Interested in this property? Visit the nearest Terrava branch to learn more or start your reservation.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5" />
                  Nearest: {getBranch(selected)}
                </div>
                <button
                  onClick={() => navigate('/branches')}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-700 transition"
                >
                  <Building2 className="w-3.5 h-3.5" /> View Branches
                </button>
              </div>
            </div>
          </div>
        )}

        {branchInfoOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Terrava Branches</h3>
                </div>
                <button onClick={() => setBranchInfoOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Visit the branch nearest to the property you are interested in.</p>
              <div className="space-y-3">
                {['Main Tagum', 'Panabo', 'Sto. Tomas', 'Davao City', 'Mati City', 'Digos City'].map((branch) => {
                  const nearest = selected ? getBranch(selected) === branch : false
                  const style = branchStyle(branch)
                  return (
                    <div key={branch} className={`rounded-xl border p-3 flex items-center justify-between ${nearest ? 'border-emerald-300 bg-emerald-50/60' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}>
                          <Building2 className={`w-4 h-4 ${style.text}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{branch}</p>
                          <p className="text-xs text-gray-500">Serving {branch.replace('Main ', '')} area</p>
                        </div>
                      </div>
                      {nearest && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                          Nearest
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => setBranchInfoOpen(false)}
                className="mt-5 w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {messageOpen && selected && (
          <MessageSellerModal
            listing={selected}
            preferredBranch={preferredBranch}
            onClose={() => setMessageOpen(false)}
          />
        )}
      </div>

      <LandDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        readOnly={user?.role === 'buyer'}
        existingPhotos={selected?.photos || []}
        initialData={
          selected
            ? (() => {
                const coords = selected.polygon_geojson?.coordinates?.[0] || []
                const points = coords.length > 1
                  ? coords.slice(0, -1).map(([lng, lat]) => [lat, lng])
                  : coords.map(([lng, lat]) => [lat, lng])
                return {
                  title: selected.title || '',
                  description: selected.description || '',
                  total_area_sqm: selected.area_sqm || '',
                  total_contract_price: selected.price || '',
                  latitude: points[0]?.[0] || '',
                  longitude: points[0]?.[1] || '',
                  polygon_points: points,
                  lot_block_number: selected.lot_block_number || '',
                zoning_classification: selected.zoning_classification || '',
                land_title_status: selected.land_title_status || '',
                reservation_fee: selected.reservation_fee || '',
                minimum_down_payment_pct: selected.minimum_down_payment_pct || '',
                cash_term_enabled: selected.cash_term_enabled || false,
                cash_term_discount_pct: selected.cash_term_discount_pct || '',
                in_house_financing_enabled: selected.in_house_financing_enabled || false,
                in_house_max_term_years: selected.in_house_max_term_years || '',
                in_house_interest_rate_pct: selected.in_house_interest_rate_pct || '',
                bank_government_loan_enabled: selected.bank_government_loan_enabled || false,
                terrain_topography: selected.terrain_topography || '',
                utilities: {
                  electricity_ready: selected.utilities?.electricity_ready || false,
                  water_ready: selected.utilities?.water_ready || false,
                  telecom_ready: selected.utilities?.telecom_ready || false
                }
              }
            })()
            : {}
        }
        onSave={(data) => console.log('Saved land details from map:', data)}
      />
    </div>
  )
}
