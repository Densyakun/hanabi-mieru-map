'use client'

import { useSnapshot } from "valtio"
import { location } from "./GlobeControls"

export default function UIContainer() {
  const { lat, lon } = useSnapshot(location)

  return (
    <div id="ui-container">
      <div className="ui-panel">
        <p>lat: {Math.floor(lat * 1000) / 1000}</p>
        <p>lon: {Math.floor(lon * 1000) / 1000}</p>
        <p><a href="https://maps.gsi.go.jp/development/ichiran.html">出典: 国土地理院 標高タイル（地球地図全球版標高第2版）</a></p>
      </div>
    </div>
  )
}
