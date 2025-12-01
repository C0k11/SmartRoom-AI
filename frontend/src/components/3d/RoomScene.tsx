'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  ContactShadows,
  Grid,
  Html,
  useProgress
} from '@react-three/drei'
import * as THREE from 'three'

interface FurnitureItemProps {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  name: string
  onSelect?: () => void
  isSelected?: boolean
}

function FurnitureItem({ position, size, color, name, onSelect, isSelected }: FurnitureItemProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={hovered || isSelected ? '#e26d47' : color} 
        roughness={0.7}
        metalness={0.1}
      />
      {(hovered || isSelected) && (
        <Html position={[0, size[1] / 2 + 0.3, 0]} center>
          <div className="px-3 py-1.5 bg-warmgray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg">
            {name}
          </div>
        </Html>
      )}
    </mesh>
  )
}

function Room() {
  // Floor
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5f1eb" roughness={0.9} />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#fefefe" roughness={0.9} />
      </mesh>
      
      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>
      
      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin mb-4" />
        <p className="text-warmgray-600">{progress.toFixed(0)}% 加载中...</p>
      </div>
    </Html>
  )
}

interface RoomSceneProps {
  furniture?: Array<{
    id: string
    name: string
    position: [number, number, number]
    size: [number, number, number]
    color: string
  }>
  onFurnitureSelect?: (id: string) => void
  selectedFurnitureId?: string | null
}

export function RoomScene({ 
  furniture = [], 
  onFurnitureSelect,
  selectedFurnitureId 
}: RoomSceneProps) {
  // Default furniture if none provided
  const defaultFurniture = [
    { id: 'sofa', name: '沙发', position: [0, 0.4, -2] as [number, number, number], size: [2.2, 0.8, 0.9] as [number, number, number], color: '#E8DED1' },
    { id: 'table', name: '茶几', position: [0, 0.25, 0] as [number, number, number], size: [1.2, 0.5, 0.6] as [number, number, number], color: '#D4A574' },
    { id: 'lamp', name: '落地灯', position: [2, 0.8, -2] as [number, number, number], size: [0.4, 1.6, 0.4] as [number, number, number], color: '#FEFEFE' },
    { id: 'shelf', name: '书架', position: [-3, 1, -4.5] as [number, number, number], size: [1.5, 2, 0.3] as [number, number, number], color: '#8B7355' },
    { id: 'plant', name: '绿植', position: [3, 0.5, -3] as [number, number, number], size: [0.5, 1, 0.5] as [number, number, number], color: '#6B8E6B' },
    { id: 'rug', name: '地毯', position: [0, 0.02, -0.5] as [number, number, number], size: [3, 0.02, 2] as [number, number, number], color: '#C9B896' },
  ]

  const items = furniture.length > 0 ? furniture : defaultFurniture

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-warmgray-100 to-warmgray-200">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={50} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={20}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-3, 3, 3]} intensity={0.3} />
          
          {/* Room structure */}
          <Room />
          
          {/* Furniture */}
          {items.map((item) => (
            <FurnitureItem
              key={item.id}
              position={item.position}
              size={item.size}
              color={item.color}
              name={item.name}
              onSelect={() => onFurnitureSelect?.(item.id)}
              isSelected={selectedFurnitureId === item.id}
            />
          ))}
          
          {/* Contact shadows */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={12}
            blur={2}
            far={4}
          />
          
          {/* Environment */}
          <Environment preset="apartment" />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

