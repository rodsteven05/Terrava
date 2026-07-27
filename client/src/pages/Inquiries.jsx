import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import api from '../api/api.js'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { MessageCircle, Send, Reply, Clock, Home, User, CheckCircle, Map, Search, X } from 'lucide-react'

export default function Inquiries() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')

  const isSeller = user?.role === 'seller'
  const isBuyer = user?.role === 'buyer'

  const fetchInquiries = () => {
    setLoading(true)
    api.get('/inquiries')
      .then((res) => setInquiries(res.data))
      .catch(() => addToast('Failed to load messages', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const handleReply = async (inquiryId) => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      await api.put(`/inquiries/${inquiryId}/reply`, { reply: replyText })
      addToast('Reply sent', 'success')
      setReplyId(null)
      setReplyText('')
      fetchInquiries()
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send reply', 'error')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (isNaN(d.getTime())) return null
    return d.toLocaleString()
  }

  const getInquiryTimestamp = (inquiry) => (
    inquiry.created_at || inquiry.createdAt || inquiry.updated_at || inquiry.updatedAt || null
  )

  const q = search.toLowerCase()
  const filteredInquiries = inquiries.filter((inq) => {
    if (!q) return true
    return (
      (inq.listing?.title || '').toLowerCase().includes(q) ||
      (inq.buyer?.full_name || '').toLowerCase().includes(q) ||
      (inq.message || '').toLowerCase().includes(q) ||
      (inq.reply || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-100 p-2 rounded-lg">
            <MessageCircle className="w-6 h-6 text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">
              {isSeller ? 'Inquiries from buyers about your listings.' : 'Your messages to sellers.'}
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-64 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filteredInquiries.length === 0 ? (
        <EmptyState
          title={inquiries.length === 0 ? "No messages yet" : "No matching messages"}
          message={isSeller
            ? (inquiries.length === 0 ? "Buyers will appear here when they message you about a listing." : "Try a different search term.")
            : (inquiries.length === 0 ? "Message a seller from a listing page to start a reservation." : "Try a different search term.")}
        />
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white rounded-2xl shadow-card border border-gray-100 p-5 ${!inq.reply && isSeller ? 'ring-1 ring-brand-100' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-brand-600" />
                  <span className="font-semibold text-gray-900">{inq.listing?.title || 'Listing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {inq.listing && (
                    <button
                      onClick={() => navigate('/map', { state: { selectedListing: inq.listing } })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Map className="w-3.5 h-3.5" /> View Map
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500" title={getInquiryTimestamp(inq) || ''}>
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(getInquiryTimestamp(inq)) || 'Timestamp unavailable'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-brand-50/60 rounded-xl p-4 border border-brand-100/60 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <User className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {isSeller ? (inq.buyer?.full_name || 'Buyer') : 'You'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{inq.message}</p>
              </div>

              {inq.reply ? (
                <div className="bg-green-50/70 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">
                      {isSeller ? 'Your reply' : 'Seller reply'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{inq.reply}</p>
                </div>
              ) : isSeller ? (
                <div className="mt-2">
                  {replyId === inq.id ? (
                    <div className="space-y-3">
                      <textarea
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setReplyId(null); setReplyText('') }}
                          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(inq.id)}
                          disabled={sending}
                          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-60 flex items-center gap-2"
                        >
                          {sending ? <Spinner size="sm" /> : <><Send className="w-4 h-4" /> Send Reply</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyId(inq.id)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-3 py-2 rounded-lg transition"
                    >
                      <Reply className="w-4 h-4" /> Reply
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-amber-600 font-medium">Waiting for seller reply.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
