'use client'

import { useSnapshot } from "valtio"
import { location } from "./GlobeControls"
import { state as pointLightState } from "./HanabiPointLight"

export default function UIContainer() {
  const { lat, lon } = useSnapshot(location)
  const { height } = useSnapshot(pointLightState)

  return (
    <div id="ui-container">
      <div className="ui-panel">
        <p>lat: {Math.floor(lat * 1000) / 1000}</p>
        <p>lon: {Math.floor(lon * 1000) / 1000}</p>
        <p><a href="https://maps.gsi.go.jp/development/ichiran.html">出典: 国土地理院 標高タイル（地球地図全球版標高第2版）</a></p>
        <p>Height of light: <input type="range" min={80 + 25} max={8850 + 600 + 275 / 2} value={pointLightState.height} onInput={event => {
          pointLightState.height = parseFloat((event.target as HTMLInputElement).value)
        }} />{height}</p>
      </div>
    </div>
  )
}
