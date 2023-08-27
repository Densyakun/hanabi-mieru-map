'use client'

import { Canvas } from '@react-three/fiber'
import GlobeControls from './GlobeControls'

export default function CanvasContainer() {
  return (
    <div id="canvas-container">
      <Canvas>
        <GlobeControls />
        <ambientLight intensity={0.1} />
        <directionalLight />
        <mesh>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </div>
  )
}
