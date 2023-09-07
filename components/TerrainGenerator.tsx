'use client'

import { location } from "./GlobeControls"
import { useEffect, useRef } from "react"
import { BufferAttribute, DoubleSide, Mesh } from "three"
import { radius, scale } from "@/lib/planet"
import SphericalMercator from "@mapbox/sphericalmercator"
import { useFrame } from "@react-three/fiber"

const zoom = 8
let currentTileX = -1
let currentTileY = -1

const tileSize = 256

var merc = new SphericalMercator({
  size: 256,
  antimeridian: true
})

export default function TerrainGenerator() {
  const meshRef = useRef<Mesh>(null!)

  const vertices = useRef(new Float32Array((tileSize + 1 - 2) ** 2 * 2 * 3 * 3))

  const applyMesh = () => {
    const { geometry } = meshRef.current
    const { position } = geometry.attributes
    position.array.set(vertices.current)
    position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  function fetchTile(tileX: number, tileY: number) {
    fetch(`https://cyberjapandata.gsi.go.jp/xyz/demgm/${zoom}/${tileX}/${tileY}.txt`)
      .then(async res => {
        const text = await res.text()

        if (tileX !== currentTileX || tileY !== currentTileY) return

        const heightmap: number[][] = text.split("\n").slice(0, tileSize).map(line =>
          line.split(",").map(point => point === "e" ? NaN : parseInt(point))
        )

        if (!heightmap.length) return

        for (let x = 0; x <= tileSize - 2; x++) {
          for (let y = 0; y <= tileSize - 2; y++) {
            const i = (y * (tileSize - 1) + x) * 2 * 3 * 3

            const isNaN =
              Number.isNaN(heightmap[y + 1][x])
              || Number.isNaN(heightmap[y + 1][x + 1])
              || Number.isNaN(heightmap[y][x + 1])
              || Number.isNaN(heightmap[y][x])

            if (isNaN) {
              vertices.current[i] =
                vertices.current[i + 1] =
                vertices.current[i + 2] =
                vertices.current[i + 3] =
                vertices.current[i + 4] =
                vertices.current[i + 5] =
                vertices.current[i + 6] =
                vertices.current[i + 7] =
                vertices.current[i + 8] =
                vertices.current[i + 9] =
                vertices.current[i + 10] =
                vertices.current[i + 11] =
                vertices.current[i + 12] =
                vertices.current[i + 13] =
                vertices.current[i + 14] =
                vertices.current[i + 15] =
                vertices.current[i + 16] =
                vertices.current[i + 17] = 0
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

              vertices.current[i] =
                vertices.current[i + 15] = Math.cos(a0) * Math.cos(b1) * h0 * scale
              vertices.current[i + 1] =
                vertices.current[i + 16] = Math.sin(b1) * h0 * scale
              vertices.current[i + 2] =
                vertices.current[i + 17] = -Math.sin(a0) * Math.cos(b1) * h0 * scale

              vertices.current[i + 3] = Math.cos(a1) * Math.cos(b1) * h1 * scale
              vertices.current[i + 4] = Math.sin(b1) * h1 * scale
              vertices.current[i + 5] = -Math.sin(a1) * Math.cos(b1) * h1 * scale

              vertices.current[i + 6] =
                vertices.current[i + 9] = Math.cos(a1) * Math.cos(b0) * h2 * scale
              vertices.current[i + 7] =
                vertices.current[i + 10] = Math.sin(b0) * h2 * scale
              vertices.current[i + 8] =
                vertices.current[i + 11] = -Math.sin(a1) * Math.cos(b0) * h2 * scale

              vertices.current[i + 12] = Math.cos(a0) * Math.cos(b0) * h3 * scale
              vertices.current[i + 13] = Math.sin(b0) * h3 * scale
              vertices.current[i + 14] = -Math.sin(a0) * Math.cos(b0) * h3 * scale
            }
          }
        }

        applyMesh()
      })
  }

  useFrame(() => {
    let [newTileX, newTileY] = merc.px([location.lon, location.lat], zoom)
      .map((value: number) => Math.floor(value / 256))

    if (newTileY < 0 || (2 ** zoom <= newTileY)) return

    if (newTileX === currentTileX && newTileY === currentTileY) return
    currentTileX = newTileX
    currentTileY = newTileY

    fetchTile(newTileX, newTileY)
  })

  useEffect(applyMesh)

  return (
    <mesh castShadow receiveShadow ref={meshRef}>
      <bufferGeometry attributes={{ "position": new BufferAttribute(vertices.current, 3) }} />
      <meshStandardMaterial shadowSide={DoubleSide} />
    </mesh>
  )
}
