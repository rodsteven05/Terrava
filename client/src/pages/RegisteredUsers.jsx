import { useCallback, useEffect, useState } from 'react'
import api from '../api/api.js'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Avatar from '../components/Avatar.jsx'
import useAutoRefresh from '../hooks/useAutoRefresh.js'
import { Users, Search, Phone, Mail, Calendar, Eye, X, User, MapPinned, Contact, IdCard } from 'lucide-react'

export default function RegisteredUsers() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBuyer, setSelectedBuyer] = useState(null)

  const fetchBuyers = useCallback(() =>
    api.get('/admin/buyers')
      .then((res) => setBuyers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false)),
  [])

  useAutoRefresh(fetchBuyers, [fetchBuyers], 30000)

  const filtered = buyers.filter((b) => {
    const q = search.toLowerCase()
    return b.full_name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q)
  })

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Registered Buyers</h1>
            <p className="text-white/70 mt-0.5 text-sm">All buyers registered in the Terrava system.</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
          <p className="text-3xl font-extrabold">{buyers.length}</p>
          <p className="text-xs text-white/70 uppercase tracking-wide font-medium">Total Buyers</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No buyers found' : 'No registered buyers yet'}
          message={search ? `No results for "${search}"` : 'Buyers will appear here once they register on Terrava.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => {
            const joinedDate = b.created_at
              ? new Date(b.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              : '—'
            return (
              <div
                key={b.id}
                className="group bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    url={b.photo_url}
                    name={b.full_name}
                    sizeClass="w-14 h-14"
                    textClass="text-lg"
                    fallbackClass="bg-gradient-to-br from-brand-600 to-brand-800"
                    className="rounded-2xl shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-lg truncate">{b.full_name}</p>
                    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize mt-1">
                      <User className="w-3 h-3" /> {b.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm text-gray-600 mb-5">
                  <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                    <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="truncate font-medium">{b.email}</span>
                  </div>
                  {b.phone ? (
                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                      <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span className="font-medium">{b.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 text-gray-400">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">No phone number</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-gray-500 text-xs px-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBuyer(b)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2.5 rounded-xl transition shadow-sm"
                >
                  <Eye className="w-4 h-4" /> View Full Info
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Info Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-5 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <IdCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Buyer Information</h2>
              </div>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <Avatar
                  url={selectedBuyer.photo_url}
                  name={selectedBuyer.full_name}
                  sizeClass="w-16 h-16"
                  textClass="text-xl"
                  fallbackClass="bg-gradient-to-br from-brand-600 to-brand-800"
                  className="rounded-2xl shadow-md"
                />
                <div>
                  <p className="font-bold text-gray-900 text-lg">{selectedBuyer.full_name}</p>
                  <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                    <User className="w-3 h-3" /> {selectedBuyer.role}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3.5 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {[
                        selectedBuyer.first_name,
                        selectedBuyer.middle_name,
                        selectedBuyer.last_name,
                        selectedBuyer.extension_name
                      ].filter(Boolean).join(' ') || selectedBuyer.full_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">{selectedBuyer.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Contact className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Numbers</p>
                    <p className="font-medium text-gray-900">{selectedBuyer.phone || '—'}</p>
                    {selectedBuyer.phone2 && <p className="text-gray-600 mt-0.5">{selectedBuyer.phone2}</p>}
                  </div>
                </div>

                {selectedBuyer.birthdate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Birthdate</p>
                      <p className="font-medium text-gray-900">{new Date(selectedBuyer.birthdate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {selectedBuyer.address && (
                  <div className="flex items-start gap-3">
                    <MapPinned className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium text-gray-900 whitespace-pre-line">{selectedBuyer.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Registered</p>
                    <p className="font-medium text-gray-900">{new Date(selectedBuyer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBuyer(null)}
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
