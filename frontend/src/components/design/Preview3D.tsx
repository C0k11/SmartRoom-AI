'use client'

import { useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Html, Text } from '@react-three/drei'
import { X, RotateCcw, ZoomIn, ZoomOut, Move, Eye } from 'lucide-react'
import * as THREE from 'three'

interface FurnitureData {
  id: string
  name: string
  category: string
  price: number
}

interface Preview3DProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  designName: string
  furniture?: FurnitureData[]
  style?: string
}

// 3D Sofa Component
function Sofa({ position, color = '#8B7355' }: { position: [number, number, number], color?: string }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.2, 0.4, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.7, -0.35]} castShadow>
        <boxGeometry args={[2.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Left Arm */}
      <mesh position={[-1.0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Right Arm */}
      <mesh position={[1.0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.5, 0.55, 0]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.7]} />
        <meshStandardMaterial color="#A0926D" />
      </mesh>
      <mesh position={[0.5, 0.55, 0]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.7]} />
        <meshStandardMaterial color="#A0926D" />
      </mesh>
    </group>
  )
}

// 3D Coffee Table
function CoffeeTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table Top */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#5D4E37" />
      </mesh>
      {/* Legs */}
      {[[-0.5, 0.2, -0.25], [0.5, 0.2, -0.25], [-0.5, 0.2, 0.25], [0.5, 0.2, 0.25]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <meshStandardMaterial color="#3D3D3D" />
        </mesh>
      ))}
    </group>
  )
}

// 3D Floor Lamp
function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.04]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.25, 0.35, 32]} />
        <meshStandardMaterial color="#F5E6D3" transparent opacity={0.9} />
      </mesh>
      {/* Light */}
      <pointLight position={[0, 1.3, 0]} intensity={0.5} color="#FFF5E6" distance={3} />
    </group>
  )
}

// 3D Bookshelf
function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 0.3]} />
        <meshStandardMaterial color="#6B5344" />
      </mesh>
      {/* Shelves */}
      {[0.3, 0.8, 1.3, 1.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.9, 0.03, 0.28]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      ))}
      {/* Books */}
      <mesh position={[-0.2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.2]} />
        <meshStandardMaterial color="#C9593A" />
      </mesh>
      <mesh position={[0.2, 1.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.18]} />
        <meshStandardMaterial color="#3D6B8C" />
      </mesh>
    </group>
  )
}

// 3D Plant
function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>
      {/* Plant */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#4A7C59" />
      </mesh>
    </group>
  )
}

// 3D Rug
function Rug({ position, color = '#9B8B7A' }: { position: [number, number, number], color?: string }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2.5, 1.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// 3D Chair
function Chair({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#5D4E37" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.75, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.05]} />
        <meshStandardMaterial color="#5D4E37" />
      </mesh>
      {/* Legs */}
      {[[-0.2, 0.22, -0.2], [0.2, 0.22, -0.2], [-0.2, 0.22, 0.2], [0.2, 0.22, 0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.45]} />
          <meshStandardMaterial color="#3D3D3D" />
        </mesh>
      ))}
    </group>
  )
}

// 3D Desk
function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table Top */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.4, 0.04, 0.7]} />
        <meshStandardMaterial color="#5D4E37" />
      </mesh>
      {/* Legs */}
      {[[-0.65, 0.37, -0.3], [0.65, 0.37, -0.3], [-0.65, 0.37, 0.3], [0.65, 0.37, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.74, 0.05]} />
          <meshStandardMaterial color="#3D3D3D" />
        </mesh>
      ))}
    </group>
  )
}

// Traditional Japanese tatami floor cushion (座布団)
function Zabuton({ position, color = '#8B4513' }: { position: [number, number, number], color?: string }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.08]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Low Japanese table (座卓)
function Zataku({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.8]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* Legs */}
      {[[-0.5, 0.15, -0.3], [0.5, 0.15, -0.3], [-0.5, 0.15, 0.3], [0.5, 0.15, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.26, 0.06]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>
      ))}
    </group>
  )
}

// Shoji screen (障子)
function ShojiScreen({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 2.2, 0.05]} />
        <meshStandardMaterial color="#D7CCC8" transparent opacity={0.85} />
      </mesh>
      {/* Grid lines - horizontal */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((y, i) => (
        <mesh key={`h${i}`} position={[0, y, 0.026]} castShadow>
          <boxGeometry args={[1.75, 0.02, 0.01]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ))}
      {/* Grid lines - vertical */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={`v${i}`} position={[x, 0, 0.026]} castShadow>
          <boxGeometry args={[0.02, 2.15, 0.01]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ))}
    </group>
  )
}

// Bonsai tree (盆栽)
function Bonsai({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.16, 16]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.25]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
      <mesh position={[0.1, 0.35, 0.05]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#388E3C" />
      </mesh>
    </group>
  )
}

// Tokonoma alcove (床の間)
function Tokonoma({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Alcove back */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshStandardMaterial color="#E8E0D5" />
      </mesh>
      {/* Platform */}
      <mesh position={[0, 0.05, 0.3]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.6]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
      {/* Hanging scroll frame */}
      <mesh position={[0, 1.5, 0.03]} castShadow>
        <boxGeometry args={[0.5, 1, 0.02]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
    </group>
  )
}

// Stone lantern (石灯籠) 
function Toro({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.1, 6]} />
        <meshStandardMaterial color="#9E9E9E" />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#9E9E9E" />
      </mesh>
      {/* Light box */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#BDBDBD" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <coneGeometry args={[0.18, 0.15, 4]} />
        <meshStandardMaterial color="#757575" />
      </mesh>
    </group>
  )
}

// Room with furniture - different layouts per style
function Room({ style, furniture = [] }: { style?: string, furniture?: FurnitureData[] }) {
  const isJapanese = style?.toLowerCase().includes('japanese') || style?.toLowerCase().includes('日式')
  
  // Style-based colors
  const styleColors = useMemo(() => {
    if (isJapanese) {
      return { floor: '#C9B896', wall: '#F5F1EB', accent: '#8B9A6B' }
    }
    switch (style) {
      case 'industrial':
        return { floor: '#6B6B6B', wall: '#A0A0A0', accent: '#8B4513' }
      case 'nordic':
        return { floor: '#E8DED1', wall: '#FEFEFE', accent: '#6B8E6B' }
      default:
        return { floor: '#D4C4B0', wall: '#F5F5F5', accent: '#3b82f6' }
    }
  }, [style, isJapanese])

  // Japanese traditional room
  if (isJapanese) {
    return (
      <group>
        {/* Tatami floor - grid pattern */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#C9B896" />
        </mesh>
        {/* Tatami borders */}
        {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
          <mesh key={`tb${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
            <planeGeometry args={[0.03, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
        ))}
        {[-3, -1.5, 0, 1.5, 3].map((z, i) => (
          <mesh key={`tb2${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
            <planeGeometry args={[8, 0.03]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
        ))}
        
        {/* Walls with wood trim */}
        <mesh position={[0, 2, -4]} receiveShadow>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial color="#F5F1EB" />
        </mesh>
        <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial color="#F5F1EB" />
        </mesh>
        <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial color="#F5F1EB" />
        </mesh>

        {/* Shoji screens */}
        <ShojiScreen position={[-2.5, 1.1, -3.9]} />
        <ShojiScreen position={[2.5, 1.1, -3.9]} />
        
        {/* Tokonoma alcove */}
        <Tokonoma position={[0, 0, -3.7]} />
        
        {/* Low table (zataku) in center */}
        <Zataku position={[0, 0, -1]} />
        
        {/* Zabuton cushions around table */}
        <Zabuton position={[-0.8, 0.04, -1]} color="#8D6E63" />
        <Zabuton position={[0.8, 0.04, -1]} color="#8D6E63" />
        <Zabuton position={[0, 0.04, 0.2]} color="#795548" />
        <Zabuton position={[0, 0.04, -2.2]} color="#795548" />
        
        {/* Bonsai trees */}
        <Bonsai position={[-3, 0, -3]} />
        <Bonsai position={[3, 0, 2]} />
        
        {/* Stone lantern */}
        <Toro position={[3, 0, -2.5]} />
        
        {/* Ikebana/flower arrangement stand */}
        <group position={[-3, 0, 1]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.5]} />
            <meshStandardMaterial color="#3E2723" />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#7CB342" />
          </mesh>
        </group>

        {/* Wood beam ceiling detail */}
        <mesh position={[0, 3.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#E8DCC8" />
        </mesh>
        {[-2, 0, 2].map((x, i) => (
          <mesh key={`beam${i}`} position={[x, 3.9, 0]} castShadow>
            <boxGeometry args={[0.15, 0.1, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
        ))}
      </group>
    )
  }

  // Modern/Western room
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={styleColors.floor} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={styleColors.wall} />
      </mesh>
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={styleColors.wall} />
      </mesh>
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={styleColors.wall} />
      </mesh>

      {/* Furniture */}
      <Sofa position={[0, 0, -2.5]} color="#8B7355" />
      <CoffeeTable position={[0, 0, -0.8]} />
      <Rug position={[0, 0.01, -1.5]} color="#9B8B7A" />
      <FloorLamp position={[-2.5, 0, -3]} />
      <Plant position={[2.5, 0, -3.5]} />
      <Bookshelf position={[-3.5, 0, -1]} />
      <Chair position={[-1.5, 0, 0.5]} rotation={Math.PI * 0.1} />
      <Chair position={[1.5, 0, 0.5]} rotation={-Math.PI * 0.1} />

      {/* Window */}
      <mesh position={[2, 2.5, -3.98]}>
        <boxGeometry args={[1.5, 1.2, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
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

export function Preview3D({ isOpen, onClose, imageUrl, designName, furniture, style }: Preview3DProps) {
  const [zoom, setZoom] = useState(50)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div>
          <h3 className="text-white font-bold text-lg">{designName} - 3D概念布局</h3>
          <p className="text-white/60 text-sm">概念性空间布局展示 · 拖拽旋转 · 滚轮缩放</p>
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
            <Room style={style} furniture={furniture} />
            
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
        <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white text-sm max-w-xs">
          <p className="text-yellow-300 text-xs mb-2">⚠️ 此为风格概念展示，非精确复制设计图</p>
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

