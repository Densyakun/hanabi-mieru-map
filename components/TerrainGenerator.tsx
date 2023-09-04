'use client'

import { location } from "./GlobeControls"
import { useRef } from "react"
import { BufferAttribute, Mesh } from "three"
import { radius } from "@/lib/planet"
import SphericalMercator from "@mapbox/sphericalmercator"
import { useFrame } from "@react-three/fiber"

const zoom = 8
let tileX = 0
let tileY = 0

const tileSize = 256

var merc = new SphericalMercator({
  size: 256,
  antimeridian: true
})

export default function TerrainGenerator() {
  const meshRef = useRef<Mesh>(null!)

  useFrame(() => {
    let [x, y] = merc.px([location.lon, location.lat], zoom)
      .map((value: number) => Math.floor(value / 256))

    if (y < 0 || (2 ** zoom <= y)) return

    if (x === tileX && y === tileY) return
    tileX = x
    tileY = y

    fetch(`https://cyberjapandata.gsi.go.jp/xyz/demgm/${zoom}/${tileX}/${tileY}.txt`)
      .then(async res => {
        const text = await res.text()

        const heightmap: number[][] = text.split("\n").slice(0, tileSize).map(line =>
          line.split(",").map(point => point === "e" ? NaN : parseInt(point))
        )

        if (!heightmap.length) return

        const vertices = new Float32Array((tileSize + 1 - 2) ** 2 * 2 * 3 * 3)
        for (let x = 0; x <= tileSize - 2; x++) {
          for (let y = 0; y <= tileSize - 2; y++) {
            const i = (y * (tileSize - 1) + x) * 2 * 3 * 3

            const isNaN =
              Number.isNaN(heightmap[y + 1][x])
              || Number.isNaN(heightmap[y + 1][x + 1])
              || Number.isNaN(heightmap[y][x + 1])
              || Number.isNaN(heightmap[y][x])

            if (isNaN) {
              vertices[i] =
                vertices[i + 1] =
                vertices[i + 2] =
                vertices[i + 3] =
                vertices[i + 4] =
                vertices[i + 5] =
                vertices[i + 6] =
                vertices[i + 7] =
                vertices[i + 8] =
                vertices[i + 9] =
                vertices[i + 10] =
                vertices[i + 11] =
                vertices[i + 12] =
                vertices[i + 13] =
                vertices[i + 14] =
                vertices[i + 15] =
                vertices[i + 16] =
                vertices[i + 17] = 0
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

              vertices[i] =
                vertices[i + 15] = Math.cos(a0) * Math.cos(b1) * h0
              vertices[i + 1] =
                vertices[i + 16] = Math.sin(b1) * h0
              vertices[i + 2] =
                vertices[i + 17] = -Math.sin(a0) * Math.cos(b1) * h0

              vertices[i + 3] = Math.cos(a1) * Math.cos(b1) * h1
              vertices[i + 4] = Math.sin(b1) * h1
              vertices[i + 5] = -Math.sin(a1) * Math.cos(b1) * h1

              vertices[i + 6] =
                vertices[i + 9] = Math.cos(a1) * Math.cos(b0) * h2
              vertices[i + 7] =
                vertices[i + 10] = Math.sin(b0) * h2
              vertices[i + 8] =
                vertices[i + 11] = -Math.sin(a1) * Math.cos(b0) * h2

              vertices[i + 12] = Math.cos(a0) * Math.cos(b0) * h3
              vertices[i + 13] = Math.sin(b0) * h3
              vertices[i + 14] = -Math.sin(a0) * Math.cos(b0) * h3
            }
          }
        }

        const { geometry } = meshRef.current
        const { position } = geometry.attributes
        position.array.set(vertices)
        position.needsUpdate = true
        geometry.computeVertexNormals()
      })
  })

  return (
    <mesh ref={meshRef}>
      <bufferGeometry attributes={{ "position": new BufferAttribute(new Float32Array((tileSize + 1 - 2) ** 2 * 2 * 3 * 3), 3) }} />
      <meshStandardMaterial />
    </mesh>
  )
}
