'use client'

import { useSnapshot } from "valtio"
import { location } from "./GlobeControls"
import { useEffect, useState } from "react"
import { BufferAttribute } from "three"
import { radius } from "@/lib/planet"
import SphericalMercator from "@mapbox/sphericalmercator"

const zoom = 6
let tileX = 0
let tileY = 0

const tileSize = 256

var merc = new SphericalMercator({
  size: 256,
  antimeridian: true
})

export default function TerrainGenerator() {
  const { lat, lon } = useSnapshot(location)

  const [heightmap, setHeightmap] = useState<number[][]>([])
  const [vertices, setVertices] = useState(new Float32Array())

  useEffect(() => {
    let [x, y] = merc.px([lon, lat], zoom)
      .map((value: number) => Math.floor(value / 256))

    if (y < 0 || (2 ** zoom <= y)) return

    if (x !== tileX) tileX = x
    if (y !== tileY) tileY = y
  }, [lat, lon])

  useEffect(() => {
    fetch(`https://cyberjapandata.gsi.go.jp/xyz/demgm/${zoom}/${tileX}/${tileY}.txt`)
      .then(async res => {
        const text = await res.text()

        setHeightmap(text.split("\n").slice(0, tileSize).map(line =>
          line.split(",").map(point => point === "e" ? NaN : parseInt(point))
        ))
      })
  }, [tileX, tileY])

  useEffect(() => {
    if (!heightmap.length) return

    const newVertices = new Float32Array((tileSize + 1 - 2) ** 2 * 2 * 3 * 3)
    for (let x = 0; x <= tileSize - 2; x++) {
      for (let y = 0; y <= tileSize - 2; y++) {
        const i = (y * (tileSize - 1) + x) * 2 * 3 * 3

        const isNaN =
          Number.isNaN(heightmap[y + 1][x])
          || Number.isNaN(heightmap[y + 1][x + 1])
          || Number.isNaN(heightmap[y][x + 1])
          || Number.isNaN(heightmap[y][x])

        if (isNaN) {
          newVertices[i] =
            newVertices[i + 1] =
            newVertices[i + 2] =
            newVertices[i + 3] =
            newVertices[i + 4] =
            newVertices[i + 5] =
            newVertices[i + 6] =
            newVertices[i + 7] =
            newVertices[i + 8] =
            newVertices[i + 9] =
            newVertices[i + 10] =
            newVertices[i + 11] =
            newVertices[i + 12] =
            newVertices[i + 13] =
            newVertices[i + 14] =
            newVertices[i + 15] =
            newVertices[i + 16] =
            newVertices[i + 17] = 0
        } else {
          const h0 = (radius + heightmap[y + 1][x]) / radius
          const h1 = (radius + heightmap[y + 1][x + 1]) / radius
          const h2 = (radius + heightmap[y][x + 1]) / radius
          const h3 = (radius + heightmap[y][x]) / radius

          const [lon0, lat0] = merc.ll([tileX * 256 + x, tileY * 256 + y], zoom)
          const [lon1, lat1] = merc.ll([tileX * 256 + x + 1, tileY * 256 + y + 1], zoom)

          const a0 = lon0 * Math.PI / 180
          const a1 = lon1 * Math.PI / 180

          const b0 = lat0 * Math.PI / 180
          const b1 = lat1 * Math.PI / 180

          newVertices[i] =
            newVertices[i + 15] = Math.cos(a0) * Math.cos(b1) * h0
          newVertices[i + 1] =
            newVertices[i + 16] = Math.sin(b1) * h0
          newVertices[i + 2] =
            newVertices[i + 17] = -Math.sin(a0) * Math.cos(b1) * h0

          newVertices[i + 3] = Math.cos(a1) * Math.cos(b1) * h1
          newVertices[i + 4] = Math.sin(b1) * h1
          newVertices[i + 5] = -Math.sin(a1) * Math.cos(b1) * h1

          newVertices[i + 6] =
            newVertices[i + 9] = Math.cos(a1) * Math.cos(b0) * h2
          newVertices[i + 7] =
            newVertices[i + 10] = Math.sin(b0) * h2
          newVertices[i + 8] =
            newVertices[i + 11] = -Math.sin(a1) * Math.cos(b0) * h2

          newVertices[i + 12] = Math.cos(a0) * Math.cos(b0) * h3
          newVertices[i + 13] = Math.sin(b0) * h3
          newVertices[i + 14] = -Math.sin(a0) * Math.cos(b0) * h3
        }
      }
    }
    setVertices(newVertices)
  }, [heightmap])

  return (
    <mesh>
      <bufferGeometry onUpdate={self => self.computeVertexNormals()} attributes={{ "position": new BufferAttribute(vertices, 3) }} />
      <meshStandardMaterial />
    </mesh>
  )
}
