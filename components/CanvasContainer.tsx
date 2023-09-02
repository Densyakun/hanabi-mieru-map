'use client'

import { Canvas } from '@react-three/fiber'
import GlobeControls from './GlobeControls'
import { PerspectiveCamera } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import TerrainGenerator from './TerrainGenerator'

export default function CanvasContainer() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!)

  return (
    <div id="canvas-container">
      <Canvas>
        <PerspectiveCamera makeDefault ref={cameraRef} near={0.001} position={[0, 0, 2]} />
        <GlobeControls camera={cameraRef.current} />
        <ambientLight intensity={0.1} />
        <directionalLight />
        <TerrainGenerator />
      </Canvas>
    </div>
  )
}
