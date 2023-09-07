'use client'

import { proxy, subscribe } from "valtio"
import { eventEmitter, location } from "./GlobeControls"
import { PointLight } from "three"
import { setLocation } from "@/lib/location"
import { useEffect, useRef } from "react"
import { radius, scale } from "@/lib/planet"

export const state = proxy({
  height: 105
})

export default function HanabiPointLight() {
  const pointLightRef = useRef<PointLight>(null!)

  useEffect(() => {
    setLocation(pointLightRef.current.position, location.lat, location.lon, (1 + state.height / radius) * scale)

    const listener = () => {
      if (!pointLightRef.current) return

      setLocation(pointLightRef.current.position, location.lat, location.lon, (1 + state.height / radius) * scale)
    }

    eventEmitter.on('changed', listener)

    subscribe(state, () => {
      if (!pointLightRef.current) return

      pointLightRef.current.position.setLength((1 + state.height / radius) * scale)
    })

    return () => {
      eventEmitter.off('changed', listener)
    }
  }, [])

  return (
    <pointLight
      ref={pointLightRef}
      position={[scale, 0, 0]}
      castShadow
      decay={0}
      power={100}
      shadow-bias={-0.0005}
    />
  )
}