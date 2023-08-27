'use client'

import { getLat, getLon, setLocation } from '@/lib/location'
import { TrackballControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { PerspectiveCamera } from 'three'
import { proxy } from 'valtio'

export const location = proxy({
  lat: 35.712,
  lon: 139.8
})

export default function GlobeControls() {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  useEffect(() => {
    setLocation(camera.position, location.lat, location.lon)
  }, [location.lat, location.lon])

  return <>
    <TrackballControls noPan minDistance={1.1} maxDistance={2} onChange={() => {
      location.lat = getLat(camera.position)
      location.lon = getLon(camera.position)
    }} />
  </>
}
