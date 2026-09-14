import { useEffect, useRef, useCallback } from 'react'

export default function useAutoRefresh(callback, deps = [], intervalMs = 30000) {
  const loadingRef = useRef(false)

  const run = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      await callback()
    } finally {
      loadingRef.current = false
    }
  }, [callback])

  useEffect(() => {
    run()

    const onFocus = () => {
      if (document.visibilityState === 'visible') run()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') run()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    let interval
    if (intervalMs > 0) {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') run()
      }, intervalMs)
    }

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      if (interval) clearInterval(interval)
    }
  }, [run, intervalMs])
}
