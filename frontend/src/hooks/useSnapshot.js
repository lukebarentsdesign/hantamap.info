import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState(null)
  const [delta,    setDelta]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchSnapshot = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/v1/snapshot`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setSnapshot(await r.json())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDelta = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/v1/delta`)
      if (r.ok) setDelta(await r.json())
    } catch { /* non-fatal */ }
  }, [])

  useEffect(() => {
    fetchSnapshot()
    fetchDelta()
    const iv = setInterval(fetchSnapshot, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [fetchSnapshot, fetchDelta])

  return { snapshot, delta, loading, error }
}
