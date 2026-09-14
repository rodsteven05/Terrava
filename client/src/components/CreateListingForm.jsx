import { useState, useRef } from 'react'
import {
  MapPin,
  FileText,
  Mountain,
  Image as ImageIcon,
  Plus,
  Upload,
  Check,
  ChevronDown,
  X
} from 'lucide-react'
import PesoIcon from './PesoIcon.jsx'
import MapView from './MapView.jsx'

const BRANCHES = [
  'Main Tagum',
  'Panabo City',
  'Sto. Tomas',
  'Davao City',
  'Mati City',
  'Digos City'
]

const ZONING_OPTIONS = [
  'Residential',
  'Commercial',
  'Agricultural',
  'Industrial'
]

const TITLE_STATUS_OPTIONS = [
  'Individual TCT Available',
  'Part of Mother Title',
  'Clean Title',
  'Under Process'
]


const TERRAIN_OPTIONS = [
  'Flat / Level',
  'Sloped / Rolling',
  'Elevated',
  'Terraced'
]

const LOT_CONFIG_OPTIONS = [
  'Corner Lot',
  'Inner Lot',
  'Main Road Facing',
  'End Lot'
]

const SectionCard = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`bg-white shadow-sm border border-slate-200 p-6 rounded-2xl ${className}`}>
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
    {children}
  </div>
)

const Label = ({ children, required }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

const Input = ({ type = 'text', value, onChange, placeholder, required, min, max, step }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    min={min}
    max={max}
    step={step}
    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
  />
)

const Select = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
)

const FileDrop = ({ label, accept, preview, fileName, isPdf, inputRef, onChange, onClear }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      className="hidden"
      onChange={onChange}
    />
    {!preview ? (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50/30 transition text-slate-500 hover:text-emerald-600"
      >
        <Upload className="w-6 h-6" />
        <span className="text-sm font-medium">Click to upload {accept.includes('pdf') ? 'PDF or image' : 'image'}</span>
        <span className="text-xs text-slate-400">Accepted: {accept}</span>
      </button>
    ) : (
      <div className="relative rounded-xl border border-slate-200 overflow-hidden group">
        {isPdf ? (
          <div className="bg-slate-50 p-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            <span className="text-sm text-slate-700 truncate">{fileName || 'Selected file'}</span>
          </div>
        ) : (
          <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
        )}
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-slate-600 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
)

export default function CreateListingForm({ onSubmit, initialBranch = '', initialData = null, existingPhotos = [], existingPhotoGeotags = [], isEdit = false }) {
  const buildInitialState = () => {
    const data = initialData || {}
    const coords = data.polygon_geojson?.coordinates?.[0] || []
    const points = coords.length > 1 ? coords.slice(0, -1).map(([lng, lat]) => [lat, lng]) : coords.map(([lng, lat]) => [lat, lng])
    return {
      title: data.title || '',
      description: data.description || '',
      branch: data.branch || initialBranch || '',
      location_text: data.location_text || '',
      area_sqm: data.area_sqm || '',
      total_area_sqm: data.total_area_sqm || data.area_sqm || '',
      latitude: data.latitude || (points[0] ? points[0][0] : ''),
      longitude: data.longitude || (points[0] ? points[0][1] : ''),
      polygon_points: data.polygon_points || points,
      zoning_classification: data.zoning_classification || '',
      land_title_status: data.land_title_status || '',
      total_contract_price: data.total_contract_price || data.price || '',
      reservation_fee: data.reservation_fee || '',
      minimum_down_payment_pct: data.minimum_down_payment_pct || '',
      cash_term_enabled: data.cash_term_enabled || false,
      cash_term_discount_pct: data.cash_term_discount_pct || '',
      in_house_financing_enabled: data.in_house_financing_enabled || false,
      in_house_max_term_years: data.in_house_max_term_years || '',
      in_house_interest_rate_pct: data.in_house_interest_rate_pct || '',
      bank_government_loan_enabled: data.bank_government_loan_enabled || false,
      penalty_rate_pct: data.penalty_rate_pct || '5.00',
      monthly_payment_amount: data.monthly_payment_amount || '',
      terrain_topography: data.terrain_topography || '',
      lot_configuration: data.lot_configuration || '',
      utilities: {
        electricity_ready: false,
        water_ready: false,
        telecom_ready: false,
        ...data.utilities
      },
      lot_block_number: data.lot_block_number || ''
    }
  }

  const [form, setForm] = useState(buildInitialState)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [tctPreview, setTctPreview] = useState(null)
  const [taxPreview, setTaxPreview] = useState(null)
  const photoInputRef = useRef(null)
  const tctInputRef = useRef(null)
  const taxInputRef = useRef(null)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateNested = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const addPolygonPoint = () => {
    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      alert('Please enter a valid latitude and longitude first.')
      return
    }
    setForm((prev) => ({
      ...prev,
      polygon_points: [...prev.polygon_points, [lat, lng]],
      latitude: '',
      longitude: ''
    }))
  }

  const removePolygonPoint = (index) => {
    setForm((prev) => ({
      ...prev,
      polygon_points: prev.polygon_points.filter((_, i) => i !== index)
    }))
  }

  const addMapPolygonPoint = ([latitude, longitude]) => {
    setForm((prev) => ({
      ...prev,
      polygon_points: [...prev.polygon_points, [latitude, longitude]]
    }))
  }

  const MAX_PHOTOS = 10

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    const currentTotal = (isEdit ? existingPhotos.length : 0) + photos.length
    if (currentTotal + files.length > MAX_PHOTOS) {
      const remaining = Math.max(0, MAX_PHOTOS - currentTotal)
      alert(`You can upload up to ${MAX_PHOTOS} photos total. You may only add ${remaining} more.`)
      e.target.value = ''
      return
    }
    setPhotos((prev) => [...prev, ...files])
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  const removePhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileSelect = (e, field, setPreview) => {
    const file = e.target.files?.[0]
    if (!file) return
    updateField(field, file)
    setPreview(URL.createObjectURL(file))
  }

  const clearFile = (field, setPreview) => {
    updateField(field, null)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.polygon_points.length > 0 && form.polygon_points.length < 3) {
      alert('Add at least 3 polygon boundary points, or remove the points to submit without a boundary.')
      return
    }

    const polygon_geojson = form.polygon_points.length >= 3
      ? {
          type: 'Polygon',
          coordinates: [[...form.polygon_points, form.polygon_points[0]].map(([lat, lng]) => [lng, lat])]
        }
      : null

    const payload = {
      ...form,
      polygon_geojson,
      photos
    }

    console.log('CreateListingForm payload:', payload)
    onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
      {/* Basic Information */}
      <SectionCard icon={MapPin} title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Label required>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. 500 sqm Agricultural Lot in Tagum"
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the land, surroundings, access roads, nearby landmarks..."
              rows={4}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
            />
          </div>
          <div>
            <Label required>Branch</Label>
            <Select
              value={form.branch}
              onChange={(e) => updateField('branch', e.target.value)}
              options={BRANCHES}
              placeholder="Select branch"
            />
          </div>
          <div>
            <Label required>Specific Location Text</Label>
            <Input
              value={form.location_text}
              onChange={(e) => updateField('location_text', e.target.value)}
              placeholder="e.g. Purok 4, Barangay Apokon"
              required
            />
          </div>
        </div>
      </SectionCard>

      {/* Spatial & GIS Data */}
      <SectionCard icon={MapPin} title="Spatial & GIS Data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label required>Area (sqm)</Label>
            <Input
              type="number"
              value={form.area_sqm}
              onChange={(e) => updateField('area_sqm', e.target.value)}
              placeholder="e.g. 500"
              required
              min={1}
              step={0.01}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Add Bounding Polygon Points</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                value={form.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                placeholder="Latitude"
                step="any"
              />
              <Input
                type="number"
                value={form.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                placeholder="Longitude"
                step="any"
              />
            </div>
            <button
              type="button"
              onClick={addPolygonPoint}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Point
            </button>

            {form.polygon_points.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.polygon_points.map(([lat, lng], idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium"
                  >
                    P{idx + 1}: {lat.toFixed(5)}, {lng.toFixed(5)}
                    <button
                      type="button"
                      onClick={() => removePolygonPoint(idx)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <Label>GIS Boundary Map</Label>
              <span className="text-xs font-medium text-emerald-700">{form.polygon_points.length} point{form.polygon_points.length === 1 ? '' : 's'} added</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Click anywhere on the map to drop a boundary point, or type lat/lng above and press Add Point. You can add 3 or more points to draw any shape — triangle, square, pentagon, hexagon, etc. There is no maximum point limit.</p>
            <MapView
              listings={[]}
              height="320px"
              boundaryPoints={form.polygon_points}
              onAddBoundaryPoint={addMapPolygonPoint}
            />
          </div>
        </div>
      </SectionCard>

      {/* Legal & Regulatory Documentation */}
      <SectionCard icon={FileText} title="Legal & Regulatory Documentation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label required>Zoning Classification</Label>
            <Select
              value={form.zoning_classification}
              onChange={(e) => updateField('zoning_classification', e.target.value)}
              options={ZONING_OPTIONS}
              placeholder="Select zoning"
            />
          </div>
          <div>
            <Label required>Land Title Status</Label>
            <Select
              value={form.land_title_status}
              onChange={(e) => updateField('land_title_status', e.target.value)}
              options={TITLE_STATUS_OPTIONS}
              placeholder="Select title status"
            />
          </div>
          <FileDrop
            label="Transfer Certificate of Title (TCT) Scanned Copy"
            accept=".pdf,.jpg,.jpeg,.png"
            preview={tctPreview}
            fileName={form.tct_file?.name}
            isPdf={form.tct_file?.type?.includes('pdf')}
            inputRef={tctInputRef}
            onChange={(e) => handleFileSelect(e, 'tct_file', setTctPreview)}
            onClear={() => clearFile('tct_file', setTctPreview)}
          />
          <FileDrop
            label="Latest Tax Declaration Receipt"
            accept=".pdf,.jpg,.jpeg,.png"
            preview={taxPreview}
            fileName={form.tax_declaration_file?.name}
            isPdf={form.tax_declaration_file?.type?.includes('pdf')}
            inputRef={taxInputRef}
            onChange={(e) => handleFileSelect(e, 'tax_declaration_file', setTaxPreview)}
            onClear={() => clearFile('tax_declaration_file', setTaxPreview)}
          />
        </div>
      </SectionCard>

      {/* Advanced Financial Configurations */}
      <SectionCard icon={PesoIcon} title="Advanced Financial Configurations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label required>Total Contract Price (PHP)</Label>
            <Input
              type="number"
              value={form.total_contract_price}
              onChange={(e) => updateField('total_contract_price', e.target.value)}
              placeholder="e.g. 2500000"
              required
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <Label required>Required Reservation Fee (PHP)</Label>
            <Input
              type="number"
              value={form.reservation_fee}
              onChange={(e) => updateField('reservation_fee', e.target.value)}
              placeholder="e.g. 25000"
              required
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <Label required>Minimum Down Payment Percentage</Label>
            <Input
              type="number"
              value={form.minimum_down_payment_pct}
              onChange={(e) => updateField('minimum_down_payment_pct', e.target.value)}
              placeholder="1–40"
              required
              min={1}
              max={40}
              step={1}
            />
          </div>
          <div>
            <Label required>Monthly Payment Amount (PHP)</Label>
            <Input
              type="number"
              value={form.monthly_payment_amount}
              onChange={(e) => updateField('monthly_payment_amount', e.target.value)}
              placeholder="e.g. 15000"
              required
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <Label required>Late Payment Penalty (%)</Label>
            <Input
              type="number"
              value={form.penalty_rate_pct}
              onChange={(e) => updateField('penalty_rate_pct', e.target.value)}
              placeholder="2–5"
              required
              min={0}
              max={100}
              step={0.01}
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
          <p className="font-semibold mb-1">Payment Reminder Policy</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Buyers receive a friendly reminder during the 30-day grace period.</li>
            <li>If unpaid after 30 days (31–60 days), a <strong>{form.penalty_rate_pct || 5}% penalty</strong> is added to the monthly dues.</li>
            <li>61–90 days delinquent: demand letter sent and account flagged for admin review.</li>
            <li>90+ days overdue: contract is cancelled and the lot becomes available again.</li>
          </ul>
        </div>

        <p className="text-xs text-slate-500 pt-2">Financing options, penalty rate, and utility details are managed by the listing owner.</p>
      </SectionCard>

      {/* Physical Attributes & Infrastructure */}
      <SectionCard icon={Mountain} title="Physical Attributes & Infrastructure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label required>Terrain Topography</Label>
            <Select
              value={form.terrain_topography}
              onChange={(e) => updateField('terrain_topography', e.target.value)}
              options={TERRAIN_OPTIONS}
              placeholder="Select terrain type"
            />
          </div>
          <div>
            <Label required>Lot Configuration Profile</Label>
            <Select
              value={form.lot_configuration}
              onChange={(e) => updateField('lot_configuration', e.target.value)}
              options={LOT_CONFIG_OPTIONS}
              placeholder="Select lot configuration"
            />
          </div>
        </div>
      </SectionCard>

      {/* Photos */}
      <SectionCard icon={ImageIcon} title="Property Photos">
        <div>
          {isEdit && existingPhotos.length > 0 && (
            <div className="mb-4">
              <Label>Current Photos</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {existingPhotos.map((url, i) => {
                  const isGeotagged = existingPhotoGeotags.some((tag) => tag.url === url)
                  return (
                    <div key={i} className="relative group w-24 h-24">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg border" />
                      {isGeotagged && (
                        <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> Geotagged
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <button
            type="button"
            disabled={(isEdit ? existingPhotos.length : 0) + photos.length >= MAX_PHOTOS}
            onClick={() => photoInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition ${
              (isEdit ? existingPhotos.length : 0) + photos.length >= MAX_PHOTOS
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-500 hover:text-emerald-600'
            }`}
          >
            <ImageIcon className="w-6 h-6" />
            <span className="text-sm font-medium">
              {isEdit ? 'Upload new property photos' : 'Click to upload property photos'}
            </span>
            <span className="text-xs text-slate-400">
              {(isEdit ? existingPhotos.length : 0) + photos.length} / {MAX_PHOTOS} photos
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              Photos with GPS metadata will be automatically geotagged
            </span>
          </button>
          {photoPreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative group w-24 h-24">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => isEdit ? setForm(buildInitialState()) : setForm({ ...form, title: '', description: '', location_text: '', area_sqm: '', latitude: '', longitude: '', polygon_points: [] })}
          className="px-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
        >
          {isEdit ? 'Revert Changes' : 'Reset'}
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Submit Listing'}
        </button>
      </div>
    </form>
  )
}
