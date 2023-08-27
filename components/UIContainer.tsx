'use client'

import { useSnapshot } from "valtio"
import { location } from "./GlobeControls"

export default function UIContainer() {
  const { lat, lon } = useSnapshot(location)

  return (
    <div id="ui-container">
      <p>lat: {Math.floor(lat * 1000) / 1000}</p>
      <p>lon: {Math.floor(lon * 1000) / 1000}</p>
    </div>
  )
}
