import { useEffect, useState } from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import api from '../../api/api.js'
import Spinner from '../../components/Spinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { CreditCard, Calendar, Download } from 'lucide-react'

export default function AdminSales() {
  const { addToast } = useToast()
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/sales-report')
      .then((res) => setReport(res.data))
      .catch(() => addToast('Failed to load sales report', 'error'))
      .finally(() => setLoading(false))
  }, [addToast])

  const total = report.reduce((sum, t) => sum + Number(t.amount), 0)

  const exportCSV = () => {
    if (report.length === 0) return
    const headers = ['ID', 'Listing', 'Buyer', 'Seller', 'Amount', 'Date']
    const rows = report.map((t) => [
      t.id,
      t.listing?.title || '',
      t.buyer?.full_name || '',
      t.seller?.full_name || '',
      t.amount,
      new Date(t.created_at || t.createdAt).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terrava-sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Sales report downloaded', 'success')
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales Report</h1>
        </div>
        <button
          onClick={exportCSV}
          disabled={report.length === 0}
          className="flex items-center gap-2 text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-extrabold text-gray-900">₱{total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {report.length === 0 ? (
        <EmptyState title="No transactions" message="No payment records have been created yet." />
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{t.listing?.title || t.id}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-brand-600">₱{Number(t.amount).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-500" /> {new Date(t.created_at || t.createdAt).toLocaleDateString()}</span>
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
