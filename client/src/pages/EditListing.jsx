import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import api from '../api/api.js'
import CreateListingForm from '../components/CreateListingForm.jsx'
import Spinner from '../components/Spinner.jsx'
import { ArrowLeft } from 'lucide-react'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch(() => addToast('Failed to load listing', 'error'))
      .finally(() => setLoading(false))
  }, [id, addToast])

  const handleSubmit = async (payload) => {
    console.log('EditListing payload:', payload)

    setSaving(true)
    const data = new FormData()
    data.append('title', payload.title || '')
    data.append('description', payload.description || '')
    data.append('price', payload.total_contract_price || payload.price || '')
    data.append('area_sqm', payload.area_sqm || '')
    data.append('location_text', payload.location_text || '')
    data.append('branch', payload.branch || user?.branch || listing?.branch || '')
    if (payload.polygon_geojson) {
      data.append('polygon_geojson', JSON.stringify(payload.polygon_geojson))
    }

    const extraData = {
      zoning_classification: payload.zoning_classification,
      land_title_status: payload.land_title_status,
      total_contract_price: payload.total_contract_price,
      reservation_fee: payload.reservation_fee,
      minimum_down_payment_pct: payload.minimum_down_payment_pct,
      cash_term_enabled: payload.cash_term_enabled,
      cash_term_discount_pct: payload.cash_term_discount_pct,
      in_house_financing_enabled: payload.in_house_financing_enabled,
      in_house_max_term_years: payload.in_house_max_term_years,
      in_house_interest_rate_pct: payload.in_house_interest_rate_pct,
      bank_government_loan_enabled: payload.bank_government_loan_enabled,
      terrain_topography: payload.terrain_topography,
      lot_configuration: payload.lot_configuration,
      utilities: payload.utilities,
      lot_block_number: payload.lot_block_number
    }
    data.append('extra_data', JSON.stringify(extraData))

    if (payload.photos && payload.photos.length > 0) {
      payload.photos.forEach((file) => data.append('photos', file))
    }

    try {
      await api.put(`/listings/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      addToast('Listing updated successfully!', 'success')
      navigate(`/listing/${id}`)
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update listing', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!listing) return <div className="max-w-3xl mx-auto px-4 py-6 text-center text-red-600">Listing not found.</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-sm text-gray-500 mt-1">Update the property details below.</p>
      </div>

      {saving && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-emerald-700">
            <Spinner size="md" />
            <span className="font-semibold">Saving changes...</span>
          </div>
        </div>
      )}

      {!saving && (
        <CreateListingForm
          isEdit
          initialData={listing}
          existingPhotos={listing.photos || []}
          initialBranch={user?.branch || listing?.branch || ''}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
