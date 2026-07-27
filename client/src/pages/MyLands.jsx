import { useEffect, useState } from 'react'
import api from '../api/api.js'
import MapView from '../components/MapView.jsx'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { MapPin, CheckCircle2, Clock, Maximize, ChevronDown, ChevronUp, Receipt, Printer, Landmark, CreditCard } from 'lucide-react'
import PesoIcon from '../components/PesoIcon.jsx'

export default function MyLands() {
  const [lands, setLands] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.get('/listings/assigned/me')
      .then((res) => setLands(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  )

  const parseReceipt = (txn) => {
    const ref = txn.reference_number || ''
    const parts = ref.split('|').map((s) => s.trim())
    return {
      receiptNumber: parts[0] || '—',
      branch: parts[1] || txn.branch || '—',
      method: txn.payment_method || '—',
      amount: Number(txn.amount) || 0,
      date: new Date(txn.created_at).toLocaleString(),
      status: txn.status
    }
  }

  const printReceipt = (land, txn) => {
    const r = parseReceipt(txn)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - Terrava</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 24px; color: #111827; background: #fff; max-width: 600px; margin: 0 auto; }
            .receipt { border: 1px dashed #d1d5db; border-radius: 20px; padding: 28px; background: #ffffff; }
            .header { text-align: center; border-bottom: 2px dashed #d1d5db; padding-bottom: 22px; margin-bottom: 22px; }
            .brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px; }
            .brand-icon { width: 38px; height: 38px; background: #059669; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
            .brand-icon svg { width: 22px; height: 22px; color: #fff; }
            .brand-name { font-size: 24px; font-weight: 800; color: #065f46; margin: 0; }
            .tagline { font-size: 13px; color: #6b7280; margin: 0 0 10px; }
            .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #065f46; background: #d1fae5; padding: 5px 14px; border-radius: 999px; text-transform: uppercase; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 20px; }
            .meta div { background: #f9fafb; border-radius: 10px; padding: 12px; }
            .meta p { margin: 0; color: #6b7280; }
            .meta strong { display: block; margin-top: 3px; color: #111827; font-weight: 700; }
            .card { background: #f9fafb; border-radius: 12px; padding: 14px; margin-bottom: 14px; }
            .card-title { font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; }
            .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .card-row:last-child { border-bottom: none; }
            .card-row span:first-child { color: #6b7280; }
            .card-row span:last-child { color: #111827; font-weight: 600; }
            .amount-card { border: 2px solid #059669; border-radius: 14px; padding: 18px; text-align: center; margin: 18px 0; background: #ecfdf5; }
            .amount-label { font-size: 12px; color: #065f46; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 6px; }
            .amount-value { font-size: 28px; font-weight: 800; color: #059669; margin: 0; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
            .status-verified { background: #d1fae5; color: #047857; }
            .status-pending { background: #fef3c7; color: #b45309; }
            .status-rejected { background: #fee2e2; color: #b91c1c; }
            .footer { text-align: center; border-top: 2px dashed #d1d5db; padding-top: 18px; margin-top: 18px; }
            .footer p { margin: 0; color: #6b7280; font-size: 12px; }
            .footer .note { font-size: 11px; color: #9ca3af; margin-top: 4px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="brand">
                <div class="brand-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="4"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                </div>
                <h1 class="brand-name">Terrava</h1>
              </div>
              <p class="tagline">Land Selling System</p>
              <span class="badge">Official Receipt</span>
            </div>

            <div class="meta">
              <div>
                <p>Receipt No.</p>
                <strong>${r.receiptNumber}</strong>
              </div>
              <div style="text-align: right;">
                <p>Date</p>
                <strong>${r.date}</strong>
              </div>
            </div>

            <div class="card">
              <p class="card-title">Property</p>
              <div class="card-row"><span>Title</span><span>${land.title}</span></div>
              <div class="card-row"><span>Location</span><span>${land.location_text}</span></div>
              <div class="card-row"><span>Seller</span><span>${land.seller?.full_name || '—'}</span></div>
              <div class="card-row"><span>Buyer</span><span>${land.assignedBuyer?.full_name || '—'}</span></div>
            </div>

            <div class="card">
              <p class="card-title">Payment Details</p>
              <div class="card-row"><span>Method</span><span style="text-transform: capitalize;">${r.method}</span></div>
              <div class="card-row"><span>Branch Paid</span><span>${r.branch}</span></div>
              <div class="card-row"><span>Status</span><span class="status status-${r.status}">${r.status}</span></div>
            </div>

            <div class="amount-card">
              <p class="amount-label">Amount Paid</p>
              <p class="amount-value">₱${r.amount.toLocaleString()}</p>
            </div>

            <div class="footer">
              <p>Thank you for trusting Terrava!</p>
              <p class="note">This receipt serves as proof of payment and is valid without a signature.</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">My Purchased Lands</h1>
        <p className="text-gray-500 mt-1">Properties assigned to you by a seller. Track your payment status here.</p>
      </div>

      {lands.length === 0 ? (
        <EmptyState
          title="No lands assigned yet"
          message="Once a seller assigns a property to your account, it will appear here with your payment tracker."
        />
      ) : (
        <div className="space-y-5">
          {lands.map((land) => {
            const verifiedTxns = (land.transactions || []).filter((t) => t.status === 'verified')
            const totalPaid = verifiedTxns.reduce((sum, t) => sum + Number(t.amount), 0)
            const originalPrice = Number(land.price)
            const remaining = Math.max(0, originalPrice - totalPaid)
            const isFullyPaid = remaining === 0
            const paidPct = originalPrice > 0 ? Math.min(100, Math.round((totalPaid / originalPrice) * 100)) : 0
            const isExpanded = expandedId === land.id

            return (
              <div key={land.id} className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-bold text-gray-900 text-lg line-clamp-1">{land.title}</h2>
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            <Clock className="w-3.5 h-3.5" /> Pending Payment
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-600" /> {land.location_text}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Seller</p>
                      <p className="text-sm font-semibold text-gray-700">{land.seller?.full_name || '—'}</p>
                    </div>
                  </div>

                  {/* Payment breakdown */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 flex flex-col items-center">
                      <PesoIcon className="w-4 h-4 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-400 mb-0.5">Original Price</p>
                      <p className="text-sm font-bold text-gray-900">₱{originalPrice.toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100 flex flex-col items-center">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 mb-1" />
                      <p className="text-xs text-brand-600 mb-0.5">Total Paid</p>
                      <p className="text-sm font-bold text-brand-700">₱{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center border flex flex-col items-center ${isFullyPaid ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      {isFullyPaid ? <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" /> : <Clock className="w-4 h-4 text-red-400 mb-1" />}
                      <p className={`text-xs mb-0.5 ${isFullyPaid ? 'text-green-600' : 'text-red-500'}`}>Remaining</p>
                      <p className={`text-sm font-bold ${isFullyPaid ? 'text-green-700' : 'text-red-700'}`}>
                        {isFullyPaid ? '₱0' : `₱${remaining.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Payment Progress</span>
                      <span className="font-bold text-brand-600">{paidPct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Details / expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : land.id)}
                    className="mt-4 flex items-center gap-2 text-sm text-brand-600 font-semibold hover:underline"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Hide Details' : 'View Details & Map'}
                  </button>
                </div>

                {/* Expanded: map + land details */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="h-56">
                      <MapView singleListing={land} height="100%" flyTo={land} />
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Maximize className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <span>{land.area_sqm} sqm</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PesoIcon className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <span>₱{originalPrice.toLocaleString()}</span>
                      </div>
                      {land.description && (
                        <div className="col-span-2 text-sm text-gray-600">{land.description}</div>
                      )}
                    </div>

                    {/* Payment transaction history / receipts */}
                    {verifiedTxns.length > 0 && (
                      <div className="px-5 pb-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Receipt className="w-4 h-4 text-brand-600" />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment History & Receipts</p>
                        </div>
                        <div className="space-y-3">
                          {verifiedTxns.map((t) => {
                            const r = parseReceipt(t)
                            return (
                              <div key={t.id} className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-white p-1.5 rounded-lg border border-brand-100">
                                      <Receipt className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900 font-mono">{r.receiptNumber}</p>
                                      <p className="text-xs text-gray-500">{r.date}</p>
                                    </div>
                                  </div>
                                  <span className={`self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                    t.status === 'verified' ? 'bg-green-100 text-green-700' :
                                    t.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {t.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="capitalize">{r.method}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Landmark className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{r.branch}</span>
                                  </div>
                                  <div className="col-span-2 flex items-center gap-1.5 text-gray-900 font-semibold">
                                    <PesoIcon className="w-3.5 h-3.5 text-brand-600" />
                                    <span>₱{r.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => printReceipt(land, t)}
                                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-brand-200 text-brand-700 text-sm font-semibold hover:bg-brand-100 transition"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
