import { useState } from 'react'

export default function PolygonEditor({ value, onChange }) {
  const [points, setPoints] = useState(value || [])
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const addPoint = () => {
    if (lat === '' || lng === '') return
    const newPoints = [...points, [Number(lng), Number(lat)]]
    setPoints(newPoints)
    onChange(newPoints)
    setLat('')
    setLng('')
  }

  const removePoint = (idx) => {
    const newPoints = points.filter((_, i) => i !== idx)
    setPoints(newPoints)
    onChange(newPoints)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="w-1/2 border rounded px-3 py-2"
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="w-1/2 border rounded px-3 py-2"
        />
        <button type="button" onClick={addPoint} className="bg-brand-600 text-white px-3 py-2 rounded hover:bg-brand-700">
          Add
        </button>
      </div>
      <ul className="text-sm space-y-1">
        {points.map((p, idx) => (
          <li key={idx} className="flex justify-between bg-gray-100 px-2 py-1 rounded">
            <span>Lat: {p[1]}, Lng: {p[0]}</span>
            <button type="button" onClick={() => removePoint(idx)} className="text-red-600">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
