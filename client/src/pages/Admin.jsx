import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext.jsx'
import api from '../api/api.js'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { CheckCircle, Users, LayoutList, ShieldCheck, User, Mail, BarChart3 } from 'lucide-react'
import PesoIcon from '../components/PesoIcon.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Admin() {
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [report, setReport] = useState([])
  const [valid, setValid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/dashboard').then((res) => setStats(res.data)),
      api.get('/admin/users').then((res) => setUsers(res.data)),
      api.get('/admin/sales-report').then((res) => setReport(res.data)),
      api.get('/blockchain/validate').then((res) => setValid(res.data.valid)),
      api.get('/listings?all=true').then((res) => setListings(res.data))
    ]).finally(() => setLoading(false))
  }, [])

  const verifyListing = async (id) => {
    try {
      await api.put(`/listings/${id}`, { is_verified: true })
      setListings(listings.map((l) => l.id === id ? { ...l, is_verified: true } : l))
      addToast('Listing verified successfully', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Verification failed', 'error')
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )

  if (loading) return <Spinner size="lg" />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview, verifications, and reports.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Users" value={stats.users} color="bg-blue-100 text-blue-700" />
          <StatCard icon={LayoutList} label="Listings" value={stats.listings} color="bg-purple-100 text-purple-700" />
          <StatCard icon={PesoIcon} label="Verified Sales" value={`₱${Number(stats.totalSales).toLocaleString()}`} color="bg-green-100 text-green-700" />
          <div className={`p-5 rounded-xl shadow-sm border flex items-center gap-4 ${valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`p-3 rounded-lg ${valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Blockchain</p>
              <p className={`text-2xl font-bold ${valid ? 'text-green-600' : 'text-red-600'}`}>{valid ? 'Valid' : 'Invalid'}</p>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-semibold text-gray-900">Monthly Sales</h2>
        </div>
        {(() => {
          const grouped = {}
          report.forEach((t) => {
            const key = new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
            grouped[key] = (grouped[key] || 0) + Number(t.amount)
          })
          const chartData = Object.entries(grouped).map(([month, amount]) => ({ month, amount }))
          return chartData.length === 0 ? (
            <EmptyState title="No sales data" message="Sales will be charted here once payments are recorded." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        })()}
      </section>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Listing Verifications</h2>
        {listings.filter((l) => !l.is_verified).length === 0 ? (
          <EmptyState title="No pending listings" message="All listings have been verified." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr><th className="px-4 py-3 text-sm">Title</th><th className="px-4 py-3 text-sm">Seller</th><th className="px-4 py-3 text-sm">Price</th><th className="px-4 py-3 text-sm">Action</th></tr>
              </thead>
              <tbody>
                {listings.filter((l) => !l.is_verified).map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3">{l.title}</td>
                    <td className="px-4 py-3">{l.seller?.full_name}</td>
                    <td className="px-4 py-3">₱{Number(l.price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => verifyListing(l.id)} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition">
                        <CheckCircle className="w-4 h-4" /> Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Users</h2>
        {users.length === 0 ? (
          <EmptyState title="No users" message="No registered users yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <div key={u.id} className="border rounded-xl p-4 flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{u.full_name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-brand-100 text-brand-700 capitalize">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Report</h2>
        {report.length === 0 ? (
          <EmptyState title="No verified sales" message="Completed transactions will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr><th className="px-4 py-3 text-sm">Property</th><th className="px-4 py-3 text-sm">Buyer</th><th className="px-4 py-3 text-sm">Seller</th><th className="px-4 py-3 text-sm">Amount</th><th className="px-4 py-3 text-sm">Date</th></tr>
              </thead>
              <tbody>
                {report.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3">{t.listing?.title}</td>
                    <td className="px-4 py-3">{t.buyer?.full_name}</td>
                    <td className="px-4 py-3">{t.seller?.full_name}</td>
                    <td className="px-4 py-3">₱{Number(t.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">{new Date(t.created_at || t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
