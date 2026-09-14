import { useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, Marker, CircleMarker, Polyline, LayersControl, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Home, Building2, Wheat, Factory, MapPinned } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { BRANCH_COORDINATES, BRANCH_ZOOM } from '../utils/branches.js'
import 'leaflet/dist/leaflet.css'

const ZONING_STYLES = {
  Residential: { icon: Home, color: '#2563eb', bg: '#dbeafe' },
  Commercial: { icon: Building2, color: '#d97706', bg: '#fef3c7' },
  Agricultural: { icon: Wheat, color: '#16a34a', bg: '#dcfce7' },
  Industrial: { icon: Factory, color: '#6b7280', bg: '#f3f4f6' },
}

function ZoningBadge({ classification, showIcon = true }) {
  if (!classification) return null
  const style = ZONING_STYLES[classification] || { icon: MapPinned, color: '#6b7280', bg: '#f3f4f6' }
  const Icon = style.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: style.bg, color: style.color,
      fontSize: 14, fontWeight: 700, padding: '4px 10px',
      borderRadius: 999, marginLeft: 'auto',
    }}>
      {showIcon && <Icon size={20} />}
      {classification}
    </span>
  )
}

function ZoningIconCircle({ classification }) {
  if (!classification) return null
  const style = ZONING_STYLES[classification] || { icon: MapPinned, color: '#6b7280', bg: '#f3f4f6' }
  const Icon = style.icon
  return (
    <div style={{
      position: 'absolute', top: 8, left: 8, zIndex: 2,
      width: 34, height: 34, borderRadius: '50%',
      background: style.bg, color: style.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      border: '2px solid #fff',
    }}>
      <Icon size={18} />
    </div>
  )
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const defaultCenter = [7.336, 125.684]

function getCentroid(coords) {
  if (!coords || coords.length === 0) return null
  const sum = coords.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0])
  return [sum[1] / coords.length, sum[0] / coords.length]
}

function formatPeso(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '₱0.00'
  return `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function canViewFinancing(user, listing) {
  if (!user) return false
  if (user.role === 'admin' || user.role === 'seller') return true
  if (user.role === 'buyer') {
    const isAssigned = listing.assigned_buyer_id && String(listing.assigned_buyer_id) === String(user.id)
    return isAssigned && listing.status !== 'available'
  }
  return false
}


function createPhotoIcon(listing, isActive) {
  const photo = listing.photos?.[0]
  const size = isActive ? 56 : 46
  const borderColor = isActive ? '#2563eb' : '#059669'

  const inner = photo
    ? `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        border:3px solid ${borderColor};
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        background:#fff url('${photo}') center/cover no-repeat;
      "></div>`
    : `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        border:3px solid ${borderColor};
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        background:#10b981;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:18px;
      ">📍</div>`

  const pointer = `<div style="
      width:0;height:0;margin:0 auto;
      border-left:7px solid transparent;
      border-right:7px solid transparent;
      border-top:9px solid ${borderColor};
    "></div>`

  return L.divIcon({
    className: 'listing-photo-marker',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">${inner}${pointer}</div>`,
    iconSize: [size, size + 9],
    iconAnchor: [size / 2, size + 9],
    popupAnchor: [0, -(size + 9)],
  })
}

function resolveFlyTo(target) {
  if (!target) return null
  if (typeof target === 'string') {
    const coords = BRANCH_COORDINATES[target]
    return coords ? { center: coords, zoom: BRANCH_ZOOM } : null
  }

  // Prefer the property's own geometry/location first so clicking a listing zooms in close.
  const polygonCoords = target.polygon_geojson?.coordinates?.[0]
  const polygonCenter = getCentroid(polygonCoords)
  if (polygonCenter) {
    return { center: polygonCenter, zoom: target.zoom || 17 }
  }

  const loc = target.location_text || ''
  const locMatch = loc.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/)
  if (locMatch) {
    const lat = parseFloat(locMatch[1])
    const lng = parseFloat(locMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { center: [lat, lng], zoom: target.zoom || 17 }
    }
  }

  if (target.center && Array.isArray(target.center)) {
    return { center: target.center, zoom: target.zoom || BRANCH_ZOOM }
  }

  if (target.branch && BRANCH_COORDINATES[target.branch]) {
    return { center: BRANCH_COORDINATES[target.branch], zoom: target.zoom || BRANCH_ZOOM }
  }

  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    const resolved = resolveFlyTo(target)
    if (!resolved) return
    map.flyTo(resolved.center, resolved.zoom, { duration: 1.2 })
  }, [map, target])
  return null
}

function FitBounds({ listings }) {
  const map = useMap()
  useEffect(() => {
    const coords = (listings || []).map((l) => {
      const polygon = l.polygon_geojson?.coordinates?.[0]
      if (polygon) return getCentroid(polygon)
      const loc = l.location_text || ''
      const match = loc.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/)
      if (match) return [parseFloat(match[1]), parseFloat(match[2])]
      return null
    }).filter(Boolean)
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14 })
    }
  }, [map, listings])
  return null
}

function BoundaryPointPicker({ onAddPoint }) {
  useMapEvents({
    click: (event) => onAddPoint?.([event.latlng.lat, event.latlng.lng])
  })
  return null
}

function DraftBoundary({ points }) {
  if (!points?.length) return null

  return (
    <>
      {points.length >= 3 ? (
        <Polygon positions={points} pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.2, weight: 3 }} />
      ) : (
        <Polyline positions={points} pathOptions={{ color: '#059669', weight: 3, dashArray: '6 6' }} />
      )}
      {points.map((point, index) => (
        <CircleMarker key={`${point[0]}-${point[1]}-${index}`} center={point} radius={7} pathOptions={{ color: '#047857', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }}>
          <Popup>Boundary point {index + 1}</Popup>
        </CircleMarker>
      ))}
    </>
  )
}

function AdminPopupActions({ listing, actions }) {
  if (!actions) return null
  const { onVerify, onEdit, onArchive } = actions
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
      {onVerify && !listing.is_verified && (
        <button
          onClick={() => onVerify(listing)}
          style={{ fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Verify
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(listing)}
          style={{ fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', cursor: 'pointer' }}
        >
          Edit
        </button>
      )}
      {onArchive && (
        <button
          onClick={() => onArchive(listing)}
          style={{ fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: listing.archived ? '#ecfdf5' : '#f3f4f6', color: listing.archived ? '#059669' : '#374151', border: listing.archived ? '1px solid #a7f3d0' : '1px solid #d1d5db', cursor: 'pointer' }}
        >
          {listing.archived ? 'Restore' : 'Archive'}
        </button>
      )}
    </div>
  )
}

function ActivePolygon({ listing, isActive, onSelect, adminActions }) {
  const polygonRef = useRef(null)
  const { user } = useAuth()
  const showFinancing = canViewFinancing(user, listing)

  useEffect(() => {
    if (isActive && polygonRef.current) {
      polygonRef.current.openPopup()
    }
  }, [isActive])

  const coords = listing.polygon_geojson?.coordinates?.[0]
  if (!coords) return null
  const latLngs = coords.map((c) => [c[1], c[0]])
  const center = getCentroid(coords)

  const popupContent = (
    <Popup>
      <div style={{ minWidth: 180 }}>
        {listing.photos?.[0] && (
          <div style={{ position: 'relative', marginBottom: 8, borderRadius: 8, overflow: 'hidden', height: 100 }}>
            <img
              src={listing.photos[0]}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <ZoningIconCircle classification={listing.zoning_classification} />
            {listing.photos.length > 1 && (
              <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
                +{listing.photos.length - 1} more
              </span>
            )}
          </div>
        )}
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{listing.title}</p>
        <p style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#059669', fontWeight: 600 }}>
          ₱{Number(listing.price).toLocaleString()}
          <ZoningBadge classification={listing.zoning_classification} showIcon={false} />
        </p>
        <p style={{ fontSize: 12, color: '#6b7280' }}>{listing.area_sqm} sqm</p>
        {listing.location_text && (
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{listing.location_text}</p>
        )}
        {showFinancing && listing.monthly_payment_amount && (
          <div style={{ fontSize: 11, color: '#374151', marginTop: 6, padding: '6px 8px', background: '#f3f4f6', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Payment Terms</div>
            {listing.in_house_max_term_years ? (
              <div>Term: {listing.in_house_max_term_years} year(s)</div>
            ) : null}
            <div>Monthly: {formatPeso(listing.monthly_payment_amount)}</div>
            {listing.penalty_rate_pct ? (
              <div>Late penalty: {listing.penalty_rate_pct}%</div>
            ) : null}
          </div>
        )}
        <p style={{ fontSize: 11, marginTop: 6, fontWeight: 600,
          color: listing.status === 'available' ? '#059669' : listing.status === 'sold' ? '#2563eb' : '#d97706',
          textTransform: 'capitalize' }}>
          {listing.status}
          {listing.installmentAccounts?.[0]?.status && (
            <span style={{ marginLeft: 6, color: '#6b7280', fontWeight: 500 }}>
              ({listing.installmentAccounts[0].status.replace(/_/g, ' ')})
            </span>
          )}
        </p>
        <AdminPopupActions listing={listing} actions={adminActions} />
      </div>
    </Popup>
  )

  return (
    <>
      <Polygon
        ref={polygonRef}
        positions={latLngs}
        pathOptions={{
          color: isActive ? '#2563eb' : '#10b981',
          fillColor: isActive ? '#3b82f6' : '#10b981',
          fillOpacity: isActive ? 0.45 : 0.2,
          weight: isActive ? 4 : 2,
        }}
        eventHandlers={{
          click: () => onSelect?.(listing),
        }}
      >
        {popupContent}
      </Polygon>
      {center && (
        <Marker
          position={center}
          icon={createPhotoIcon(listing, isActive)}
          eventHandlers={{ click: () => onSelect?.(listing) }}
        >
          {popupContent}
        </Marker>
      )}
    </>
  )
}

function PhotoGeotagMarkers({ listing }) {
  if (!listing.photo_geotags?.length) return null

  return (
    <>
      {listing.photo_geotags.map((tag, i) => (
        <CircleMarker
          key={`photo-${listing.id}-${i}`}
          center={[tag.lat, tag.lng]}
          radius={5}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>
            <div style={{ minWidth: 140, textAlign: 'center' }}>
              <img
                src={tag.url}
                alt=""
                style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }}
              />
              <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>Photo geotag</p>
              <p style={{ fontSize: 10, color: '#6b7280' }}>{Number(tag.lat).toFixed(5)}, {Number(tag.lng).toFixed(5)}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

function FallbackMarker({ listing, isActive, onSelect, adminActions }) {
  const markerRef = useRef(null)
  const { user } = useAuth()
  const showFinancing = canViewFinancing(user, listing)

  useEffect(() => {
    if (isActive && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [isActive])

  const loc = listing.location_text || ''
  const match = loc.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/)
  if (!match) return null
  const lat = parseFloat(match[1])
  const lng = parseFloat(match[2])
  if (isNaN(lat) || isNaN(lng)) return null

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={createPhotoIcon(listing, isActive)}
      eventHandlers={{ click: () => onSelect?.(listing) }}
    >
      <Popup>
        <div style={{ minWidth: 180 }}>
          {listing.photos?.[0] && (
            <div style={{ position: 'relative', marginBottom: 8, borderRadius: 8, overflow: 'hidden', height: 100 }}>
              <img
                src={listing.photos[0]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <ZoningIconCircle classification={listing.zoning_classification} />
              {listing.photos.length > 1 && (
                <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
                  +{listing.photos.length - 1} more
                </span>
              )}
            </div>
          )}
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{listing.title}</p>
          <p style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#059669', fontWeight: 600 }}>
            ₱{Number(listing.price).toLocaleString()}
            <ZoningBadge classification={listing.zoning_classification} showIcon={false} />
          </p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{listing.area_sqm} sqm</p>
          {showFinancing && listing.monthly_payment_amount && (
            <div style={{ fontSize: 11, color: '#374151', marginTop: 6, padding: '6px 8px', background: '#f3f4f6', borderRadius: 6 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Payment Terms</div>
              {listing.in_house_max_term_years ? (
                <div>Term: {listing.in_house_max_term_years} year(s)</div>
              ) : null}
              <div>Monthly: {formatPeso(listing.monthly_payment_amount)}</div>
              {listing.penalty_rate_pct ? (
                <div>Late penalty: {listing.penalty_rate_pct}%</div>
              ) : null}
            </div>
          )}
          <p style={{ fontSize: 11, marginTop: 6, fontWeight: 600,
            color: listing.status === 'available' ? '#059669' : listing.status === 'sold' ? '#2563eb' : '#d97706',
            textTransform: 'capitalize' }}>
            {listing.status}
            {listing.installmentAccounts?.[0]?.status && (
              <span style={{ marginLeft: 6, color: '#6b7280', fontWeight: 500 }}>
                ({listing.installmentAccounts[0].status.replace(/_/g, ' ')})
              </span>
            )}
          </p>
          <AdminPopupActions listing={listing} actions={adminActions} />
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapView({
  listings,
  height = '500px',
  singleListing = null,
  flyTo = null,
  onSelectListing = null,
  selectedListingId = null,
  dragging = true,
  scrollWheelZoom = true,
  zoomControl = true,
  doubleClickZoom = true,
  boundaryPoints = [],
  onAddBoundaryPoint = null,
  fitBounds = false,
  adminActions = null,
  containerClassName = null,
  showLayersControl = true,
  showAttribution = true,
}) {
  const selectListingRef = useRef(onSelectListing)
  useEffect(() => { selectListingRef.current = onSelectListing }, [onSelectListing])

  const handleSelectListing = useCallback((listing) => {
    selectListingRef.current?.(listing)
  }, [])

  const display = singleListing ? [singleListing] : listings || []

  const firstCoords = display.find((l) => l.polygon_geojson?.coordinates?.[0])?.polygon_geojson?.coordinates?.[0]
  const center = getCentroid(firstCoords) || defaultCenter

  return (
    <div style={{ height }} className={containerClassName || 'rounded-lg overflow-hidden border shadow'}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={scrollWheelZoom}
        dragging={dragging}
        zoomControl={zoomControl}
        doubleClickZoom={doubleClickZoom}
        attributionControl={showAttribution}
        style={{ height: '100%', width: '100%' }}
      >
        {showLayersControl ? (
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Standard map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
        ) : (
          <TileLayer
            attribution={showAttribution ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' : ''}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <FlyTo target={flyTo} />
        {fitBounds && <FitBounds listings={display} />}
        {onAddBoundaryPoint && <BoundaryPointPicker onAddPoint={onAddBoundaryPoint} />}
        <DraftBoundary points={boundaryPoints} />
        {display.map((listing) => {
          const isActive = selectedListingId
            ? listing.id === selectedListingId
            : flyTo?.id === listing.id
          const hasPolygon = !!listing.polygon_geojson?.coordinates?.[0]
          return hasPolygon ? (
            <ActivePolygon
              key={listing.id}
              listing={listing}
              isActive={isActive}
              onSelect={handleSelectListing}
              adminActions={adminActions}
            />
          ) : (
            <FallbackMarker
              key={listing.id}
              listing={listing}
              isActive={isActive}
              onSelect={handleSelectListing}
              adminActions={adminActions}
            />
          )
        })}
        {display.map((listing) => (
          <PhotoGeotagMarkers key={`geotags-${listing.id}`} listing={listing} />
        ))}
      </MapContainer>
    </div>
  )
}
