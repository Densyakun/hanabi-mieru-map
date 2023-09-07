'use client'

import { Canvas } from '@react-three/fiber'
import HanabiPointLight from './HanabiPointLight'
import TerrainGenerator from './TerrainGenerator'
import CameraAndControls from './CameraAndControls'

export default function CanvasContainer() {
  return (
    <div id="canvas-container">
      <Canvas shadows>
        <CameraAndControls />
        <TerrainGenerator />
        <HanabiPointLight />
      </Canvas>
    </div>
  )
}
