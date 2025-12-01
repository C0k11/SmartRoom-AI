'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei'
import { X, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react'
import * as THREE from 'three'

interface Preview3DProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  designName: string
}

// Room component - displays the design image as a 3D room
function Room({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Create a simple room box with the design image as texture
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* Back wall with design image */}
      <mesh position={[0, 1, -5]} ref={meshRef}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial>
          <primitive attach="map" object={new THREE.TextureLoader().load(imageUrl)} />
        </meshStandardMaterial>
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[5, 1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>加载3D场景中...</p>
      </div>
    </Html>
  )
}

export function Preview3D({ isOpen, onClose, imageUrl, designName }: Preview3DProps) {
  const [zoom, setZoom] = useState(50)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div>
          <h3 className="text-white font-bold text-lg">{designName} - 3D预览</h3>
          <p className="text-white/60 text-sm">拖拽旋转 · 滚轮缩放 · 右键平移</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows>
          <Suspense fallback={<LoadingFallback />}>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={zoom} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={20}
              target={[0, 1, 0]}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, 5]} intensity={0.5} />
            
            {/* Room */}
            <Room imageUrl={imageUrl} />
            
            {/* Environment for realistic lighting */}
            <Environment preset="apartment" />
          </Suspense>
        </Canvas>
        
        {/* Controls overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={() => setZoom(z => Math.max(30, z - 10))}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(80, z + 10))}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(50)}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="重置视角"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Instructions */}
        <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Move className="w-4 h-4" />
            <span>左键拖拽旋转</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <ZoomIn className="w-4 h-4" />
            <span>滚轮缩放</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>右键平移</span>
          </div>
        </div>
      </div>
    </div>
  )
}

