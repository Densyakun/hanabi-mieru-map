'use client'

import { getLat, getLon, setLocation } from '@/lib/location'
import { TrackballControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { ComponentProps, useEffect, useState } from 'react'
import { PerspectiveCamera } from 'three'
import { proxy, useSnapshot } from 'valtio'

export const location = proxy({
  lat: 35.712,
  lon: 139.8
})

export default function GlobeControls(props: ComponentProps<typeof TrackballControls>) {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  const { lat, lon } = useSnapshot(location)

  const [rotateSpeed, setRotateSpeed] = useState(camera.position.length())

  useEffect(() => {
    setLocation(camera.position, lat, lon)
  }, [])

  useEffect(() => {
    setRotateSpeed((camera.position.length() - 1) * 0.3)
  }, [lat, lon])

  return <>
    <TrackballControls
      noPan
      minDistance={1.01}
      maxDistance={2}
      onChange={() => {
        location.lat = getLat(camera.position)
        location.lon = getLon(camera.position)
      }}
      rotateSpeed={rotateSpeed}
      {...props}
    />
  </>
}
