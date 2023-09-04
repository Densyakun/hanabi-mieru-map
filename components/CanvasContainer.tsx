'use client'

import { Canvas } from '@react-three/fiber'
import TerrainGenerator from './TerrainGenerator'
import CameraAndControls from './CameraAndControls'

export default function CanvasContainer() {
  return (
    <div id="canvas-container">
      <Canvas>
        <CameraAndControls />
        <ambientLight intensity={0.1} />
        <directionalLight />
        <TerrainGenerator />
      </Canvas>
    </div>
  )
}
