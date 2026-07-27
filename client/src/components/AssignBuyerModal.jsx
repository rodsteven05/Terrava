import { useState, useEffect } from 'react'
import api from '../api/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { X, Search, UserCheck, Loader2 } from 'lucide-react'

export default function AssignBuyerModal({ listing, onClose, onAssigned }) {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      api.get(`/admin/buyers${search ? `?search=${encodeURIComponent(search)}` : ''}`)
        .then((res) => setBuyers(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleAssign = async () => {
    if (!selected) return
    setAssigning(true)
    try {
      await api.post(`/listings/${listing.id}/assign`, { buyer_id: selected.id })
      addToast(`Listing assigned to ${selected.full_name}`, 'success')
      onAssigned?.()
      onClose()
    } catch (err) {
      addToast(err.response?.data?.error || 'Assignment failed', 'error')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Assign to Buyer</h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{listing.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search buyers by name or email…"
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelected(null) }}
              autoFocus
            />
          </div>
        </div>

        {/* Buyer list */}
        <div className="max-h-64 overflow-y-auto px-3 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
            </div>
          ) : buyers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {search ? `No buyers found for "${search}"` : 'No registered buyers yet'}
            </div>
          ) : (
            buyers.map((b) => {
              const initials = b.full_name
                ? b.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                : 'U'
              const isSelected = selected?.id === b.id
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(isSelected ? null : b)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition text-left mb-1 ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'hover:bg-brand-50 text-gray-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                  }`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {b.full_name}
                    </p>
                    <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                      {b.email}
                    </p>
                  </div>
                  {isSelected && <UserCheck className="w-4 h-4 text-white flex-shrink-0" />}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || assigning}
            className="btn-primary flex-1 justify-center disabled:opacity-50"
          >
            {assigning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Assigning…</>
            ) : (
              <><UserCheck className="w-4 h-4" /> Assign Buyer</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
