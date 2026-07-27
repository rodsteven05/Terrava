import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, Marker, CircleMarker, Polyline, LayersControl, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (!target) return
    const coords = target.polygon_geojson?.coordinates?.[0]
    const center = getCentroid(coords)
    if (!center) return
    map.flyTo(center, 17, { duration: 1.2 })
  }, [map, target])
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

function ActivePolygon({ listing, isActive, onSelect }) {
  const polygonRef = useRef(null)

  useEffect(() => {
    if (isActive && polygonRef.current) {
      polygonRef.current.openPopup()
    }
  }, [isActive])

  const coords = listing.polygon_geojson?.coordinates?.[0]
  if (!coords) return null
  const latLngs = coords.map((c) => [c[1], c[0]])

  return (
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
      <Popup>
        <div style={{ minWidth: 180 }}>
          {listing.photos?.[0] && (
            <div style={{ position: 'relative', marginBottom: 8, borderRadius: 8, overflow: 'hidden', height: 100 }}>
              <img
                src={listing.photos[0]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {listing.photos.length > 1 && (
                <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
                  +{listing.photos.length - 1} more
                </span>
              )}
            </div>
          )}
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{listing.title}</p>
          <p style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>₱{Number(listing.price).toLocaleString()}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{listing.area_sqm} sqm</p>
          {listing.location_text && (
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{listing.location_text}</p>
          )}
          <p style={{ fontSize: 11, marginTop: 6, fontWeight: 600,
            color: listing.status === 'available' ? '#059669' : '#d97706',
            textTransform: 'capitalize' }}>
            {listing.status}
          </p>
        </div>
      </Popup>
    </Polygon>
  )
}

function FallbackMarker({ listing, isActive, onSelect }) {
  const markerRef = useRef(null)

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
              {listing.photos.length > 1 && (
                <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
                  +{listing.photos.length - 1} more
                </span>
              )}
            </div>
          )}
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{listing.title}</p>
          <p style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>₱{Number(listing.price).toLocaleString()}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{listing.area_sqm} sqm</p>
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
  dragging = true,
  scrollWheelZoom = true,
  zoomControl = true,
  doubleClickZoom = true,
  boundaryPoints = [],
  onAddBoundaryPoint = null,
}) {
  const display = singleListing ? [singleListing] : listings || []

  const firstCoords = display.find((l) => l.polygon_geojson?.coordinates?.[0])?.polygon_geojson?.coordinates?.[0]
  const center = getCentroid(firstCoords) || defaultCenter

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border shadow">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={scrollWheelZoom}
        dragging={dragging}
        zoomControl={zoomControl}
        doubleClickZoom={doubleClickZoom}
        style={{ height: '100%', width: '100%' }}
      >
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
        <FlyTo target={flyTo} />
        {onAddBoundaryPoint && <BoundaryPointPicker onAddPoint={onAddBoundaryPoint} />}
        <DraftBoundary points={boundaryPoints} />
        {display.map((listing) => {
          const isActive = flyTo?.id === listing.id
          const hasPolygon = !!listing.polygon_geojson?.coordinates?.[0]
          return hasPolygon ? (
            <ActivePolygon
              key={listing.id}
              listing={listing}
              isActive={isActive}
              onSelect={onSelectListing}
            />
          ) : (
            <FallbackMarker
              key={listing.id}
              listing={listing}
              isActive={isActive}
              onSelect={onSelectListing}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
