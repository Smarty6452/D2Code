'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false, error: 'Geolocation not supported' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Round to 2 decimal places for privacy (~1 km precision)
        setState({
          lat: Math.round(pos.coords.latitude * 100) / 100,
          lng: Math.round(pos.coords.longitude * 100) / 100,
          error: null,
          loading: false,
        })
      },
      (err) => {
        setState({ lat: null, lng: null, error: err.message, loading: false })
      },
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 }
    )
  }, [])

  return state
}
