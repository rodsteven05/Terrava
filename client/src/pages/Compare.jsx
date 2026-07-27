import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { Scale, X, MapPin, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function Compare() {
  const [ids, setIds] = useState([])
  const [listings, setListings] = useState([])
  const [all, setAll] = useState([])
  const navigate = useNavigate()
  const { addToast } = useToast()

  useEffect(() => {
    api.get('/listings').then((res) => setAll(res.data))
    const saved = JSON.parse(localStorage.getItem('compareIds') || '[]')
    setIds(saved)
  }, [])

  useEffect(() => {
    setListings(all.filter((l) => ids.includes(l.id)))
  }, [ids, all])

  const remove = (id) => {
    const next = ids.filter((x) => x !== id)
    setIds(next)
    localStorage.setItem('compareIds', JSON.stringify(next))
  }

  const addId = (id) => {
    if (ids.includes(id)) {
      addToast('Already in comparison', 'info')
      return
    }
    if (ids.length >= 3) {
      addToast('You can compare up to 3 listings', 'error')
      return
    }
    const next = [...ids, id]
    setIds(next)
    localStorage.setItem('compareIds', JSON.stringify(next))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compare Properties</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <p className="text-sm text-gray-600 mb-2">Add a property to compare (max 3)</p>
        <select
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          onChange={(e) => e.target.value && addId(Number(e.target.value))}
          value=""
        >
          <option value="">Select a listing...</option>
          {all.map((l) => (
            <option key={l.id} value={l.id}>{l.title} - ₱{Number(l.price).toLocaleString()}</option>
          ))}
        </select>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No listings selected for comparison.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{l.title}</h3>
                <button onClick={() => remove(l.id)} className="text-gray-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-brand-600">₱{Number(l.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Area</span>
                  <span className="font-semibold">{l.area_sqm} sqm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="capitalize">{l.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified</span>
                  {l.is_verified ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="line-clamp-2">{l.location_text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
