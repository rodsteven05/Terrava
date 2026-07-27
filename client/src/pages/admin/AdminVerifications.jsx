import { useEffect, useState } from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import api from '../../api/api.js'
import Spinner from '../../components/Spinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { CheckCircle, ShieldCheck } from 'lucide-react'

export default function AdminVerifications() {
  const { addToast } = useToast()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/listings?all=true')
      .then((res) => setListings(res.data))
      .catch(() => addToast('Failed to load listings', 'error'))
      .finally(() => setLoading(false))
  }, [addToast])

  const verifyListing = async (id) => {
    try {
      await api.put(`/listings/${id}`, { is_verified: true })
      setListings(listings.map((l) => l.id === id ? { ...l, is_verified: true } : l))
      addToast('Listing verified successfully', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Verification failed', 'error')
    }
  }

  const pending = listings.filter((l) => !l.is_verified)

  if (loading) return <Spinner size="lg" />

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-brand-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Listing Verifications</h1>
      </div>

      {pending.length === 0 ? (
        <EmptyState title="No pending listings" message="All listings have been verified." />
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pending.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{l.title}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{l.seller?.full_name}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-brand-600">₱{Number(l.price).toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => verifyListing(l.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
