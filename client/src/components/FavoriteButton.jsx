import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import api from '../api/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function FavoriteButton({ listingId, className = '', size = 20, showLabel = false, onToggle }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user || !listingId) return
    let cancelled = false
    api.get(`/favorites/${listingId}`)
      .then((res) => {
        if (!cancelled) {
          setIsFavorite(res.data.isFavorite)
          setChecked(true)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user, listingId])

  if (!user || (user.role !== 'buyer' && user.role !== 'admin')) return null

  const handleClick = async (e) => {
    if (e) e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${listingId}`)
        setIsFavorite(false)
        addToast('Removed from favorites', 'success')
        onToggle?.(false)
      } else {
        await api.post(`/favorites/${listingId}`)
        setIsFavorite(true)
        addToast('Added to favorites', 'success')
        onToggle?.(true)
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update favorites', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || !checked}
      className={`inline-flex items-center gap-1.5 transition ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`transition ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        size={size}
      />
      {showLabel && (
        <span className={`text-sm font-medium ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}>
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  )
}
