'use client'

import { useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  ContactShadows,
  Grid,
  Html,
  useProgress,
  RoundedBox,
  Cylinder,
  Sphere
} from '@react-three/drei'
import * as THREE from 'three'

interface FurnitureItemProps {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  name: string
  type?: 'sofa' | 'table' | 'lamp' | 'shelf' | 'plant' | 'rug' | 'chair' | 'bed' | 'default'
  onSelect?: () => void
  isSelected?: boolean
}

// 沙发组件 - 更真实的3D形状
function Sofa({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  return (
    <group position={position}>
      {/* 座垫 */}
      <RoundedBox args={[size[0], size[1] * 0.4, size[2] * 0.8]} radius={0.05} position={[0, size[1] * 0.2, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 靠背 */}
      <RoundedBox args={[size[0], size[1] * 0.6, size[2] * 0.2]} radius={0.05} position={[0, size[1] * 0.5, -size[2] * 0.3]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 左扶手 */}
      <RoundedBox args={[size[0] * 0.1, size[1] * 0.5, size[2] * 0.8]} radius={0.03} position={[-size[0] * 0.45, size[1] * 0.35, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 右扶手 */}
      <RoundedBox args={[size[0] * 0.1, size[1] * 0.5, size[2] * 0.8]} radius={0.03} position={[size[0] * 0.45, size[1] * 0.35, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 腿 */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.03, 0.03, 0.1, 8]} position={[x * size[0] * 0.4, 0.05, z * size[2] * 0.3]} castShadow>
          <meshStandardMaterial color="#3d3d3d" metalness={0.3} roughness={0.5} />
        </Cylinder>
      ))}
    </group>
  )
}

// 茶几组件
function CoffeeTable({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  return (
    <group position={position}>
      {/* 桌面 */}
      <RoundedBox args={[size[0], 0.05, size[2]]} radius={0.02} position={[0, size[1], 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.3} metalness={0.1} />
      </RoundedBox>
      {/* 桌腿 */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.04, 0.04, size[1], 8]} position={[x * size[0] * 0.4, size[1] / 2, z * size[2] * 0.4]} castShadow>
          <meshStandardMaterial color="#8B7355" metalness={0.2} roughness={0.6} />
        </Cylinder>
      ))}
      {/* 下层隔板 */}
      <RoundedBox args={[size[0] * 0.8, 0.02, size[2] * 0.8]} radius={0.01} position={[0, size[1] * 0.3, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.4} />
      </RoundedBox>
    </group>
  )
}

// 落地灯组件
function FloorLamp({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  return (
    <group position={position}>
      {/* 灯座 */}
      <Cylinder args={[0.15, 0.2, 0.05, 16]} position={[0, 0.025, 0]} castShadow>
        <meshStandardMaterial color="#2f2f2f" metalness={0.5} roughness={0.3} />
      </Cylinder>
      {/* 灯杆 */}
      <Cylinder args={[0.02, 0.02, size[1] * 0.8, 8]} position={[0, size[1] * 0.4, 0]} castShadow>
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* 灯罩 */}
      <mesh position={[0, size[1] * 0.85, 0]} castShadow>
        <coneGeometry args={[0.25, 0.35, 16, 1, true]} />
        <meshStandardMaterial color={activeColor} side={THREE.DoubleSide} roughness={0.9} transparent opacity={0.9} />
      </mesh>
      {/* 光源 */}
      <pointLight position={[0, size[1] * 0.8, 0]} intensity={0.5} color="#fff5e6" distance={3} />
    </group>
  )
}

// 书架组件
function Bookshelf({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  const shelfCount = 4
  return (
    <group position={position}>
      {/* 侧板 */}
      <RoundedBox args={[0.03, size[1], size[2]]} radius={0.01} position={[-size[0] / 2, size[1] / 2, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.03, size[1], size[2]]} radius={0.01} position={[size[0] / 2, size[1] / 2, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.7} />
      </RoundedBox>
      {/* 背板 */}
      <RoundedBox args={[size[0], size[1], 0.02]} radius={0.01} position={[0, size[1] / 2, -size[2] / 2 + 0.01]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 隔板 */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <RoundedBox key={i} args={[size[0] - 0.06, 0.02, size[2]]} radius={0.005} position={[0, (i + 1) * size[1] / shelfCount, 0]} castShadow>
          <meshStandardMaterial color={activeColor} roughness={0.7} />
        </RoundedBox>
      ))}
      {/* 装饰书籍 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <RoundedBox key={`book-${i}`} args={[0.03, 0.2 + Math.random() * 0.1, 0.15]} radius={0.005} position={[-size[0] / 3 + i * 0.08, size[1] * 0.6, 0]} castShadow>
          <meshStandardMaterial color={['#8B4513', '#2F4F4F', '#4A4A4A', '#CD853F', '#556B2F'][i]} roughness={0.9} />
        </RoundedBox>
      ))}
    </group>
  )
}

// 绿植组件
function Plant({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  return (
    <group position={position}>
      {/* 花盆 */}
      <Cylinder args={[size[0] * 0.4, size[0] * 0.3, size[1] * 0.3, 16]} position={[0, size[1] * 0.15, 0]} castShadow>
        <meshStandardMaterial color="#D2691E" roughness={0.9} />
      </Cylinder>
      {/* 土壤 */}
      <Cylinder args={[size[0] * 0.35, size[0] * 0.35, 0.05, 16]} position={[0, size[1] * 0.3, 0]}>
        <meshStandardMaterial color="#3d2817" roughness={1} />
      </Cylinder>
      {/* 植物叶子 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const leafHeight = size[1] * 0.4 + Math.random() * size[1] * 0.3
        return (
          <group key={i} position={[0, size[1] * 0.35, 0]} rotation={[0, angle, 0]}>
            <mesh position={[0.1, leafHeight / 2, 0]} rotation={[0.3, 0, 0.2 + Math.random() * 0.3]} castShadow>
              <planeGeometry args={[0.15, leafHeight]} />
              <meshStandardMaterial color={activeColor !== '#e26d47' ? activeColor : '#6B8E6B'} side={THREE.DoubleSide} roughness={0.8} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// 地毯组件
function Rug({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  return (
    <group position={position}>
      <RoundedBox args={[size[0], 0.02, size[2]]} radius={0.1} position={[0, 0.01, 0]} receiveShadow>
        <meshStandardMaterial color={activeColor} roughness={1} />
      </RoundedBox>
      {/* 地毯图案 - 简单的边框 */}
      <RoundedBox args={[size[0] - 0.3, 0.025, size[2] - 0.3]} radius={0.08} position={[0, 0.015, 0]} receiveShadow>
        <meshStandardMaterial color={new THREE.Color(activeColor).multiplyScalar(0.85).getStyle()} roughness={1} />
      </RoundedBox>
    </group>
  )
}

// 椅子组件
function Chair({ position, size, color, isSelected, hovered }: { position: [number, number, number], size: [number, number, number], color: string, isSelected?: boolean, hovered: boolean }) {
  const activeColor = hovered || isSelected ? '#e26d47' : color
  return (
    <group position={position}>
      {/* 座垫 */}
      <RoundedBox args={[size[0], 0.08, size[2]]} radius={0.02} position={[0, size[1] * 0.45, 0]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 靠背 */}
      <RoundedBox args={[size[0], size[1] * 0.5, 0.05]} radius={0.02} position={[0, size[1] * 0.75, -size[2] * 0.45]} castShadow>
        <meshStandardMaterial color={activeColor} roughness={0.8} />
      </RoundedBox>
      {/* 腿 */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.02, 0.02, size[1] * 0.45, 8]} position={[x * size[0] * 0.4, size[1] * 0.22, z * size[2] * 0.4]} castShadow>
          <meshStandardMaterial color="#3d3d3d" metalness={0.4} roughness={0.4} />
        </Cylinder>
      ))}
    </group>
  )
}

function FurnitureItem({ position, size, color, name, type = 'default', onSelect, isSelected }: FurnitureItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })

  const renderFurniture = () => {
    const props = { position: [0, 0, 0] as [number, number, number], size, color, isSelected, hovered }
    switch (type) {
      case 'sofa': return <Sofa {...props} />
      case 'table': return <CoffeeTable {...props} />
      case 'lamp': return <FloorLamp {...props} />
      case 'shelf': return <Bookshelf {...props} />
      case 'plant': return <Plant {...props} />
      case 'rug': return <Rug {...props} />
      case 'chair': return <Chair {...props} />
      default:
        return (
          <RoundedBox args={size} radius={0.05} castShadow receiveShadow>
            <meshStandardMaterial color={hovered || isSelected ? '#e26d47' : color} roughness={0.7} metalness={0.1} />
          </RoundedBox>
        )
    }
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderFurniture()}
      {(hovered || isSelected) && (
        <Html position={[0, size[1] + 0.3, 0]} center>
          <div className="px-3 py-1.5 bg-warmgray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg">
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

function Room() {
  // 使用纹理增强墙面和地板
  return (
    <group>
      {/* Floor - 木地板效果 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} metalness={0.05} />
      </mesh>
      {/* 地板线条纹理 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4.75 + i * 0.5, 0.001, 0]} receiveShadow>
          <planeGeometry args={[0.02, 10]} />
          <meshStandardMaterial color="#c49a6c" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Back wall */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#fefefe" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 2, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.95} />
      </mesh>

      {/* 窗户 - 左墙 */}
      <group position={[-4.99, 2.2, -1]}>
        {/* 窗框 */}
        <RoundedBox args={[0.05, 1.8, 2.5]} radius={0.02}>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </RoundedBox>
        {/* 窗户玻璃 */}
        <mesh position={[0.02, 0, 0]}>
          <planeGeometry args={[0.02, 1.6, 2.3]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} roughness={0.1} metalness={0.9} />
        </mesh>
        {/* 窗户分隔条 */}
        <RoundedBox args={[0.06, 0.03, 2.3]} radius={0.01} position={[0.02, 0, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.06, 1.6, 0.03]} radius={0.01} position={[0.02, 0, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </RoundedBox>
      </group>

      {/* 踢脚线 */}
      <RoundedBox args={[10, 0.1, 0.02]} radius={0.01} position={[0, 0.05, -4.99]}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.02, 0.1, 10]} radius={0.01} position={[-4.99, 0.05, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.02, 0.1, 10]} radius={0.01} position={[4.99, 0.05, 0]}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
      </RoundedBox>

      {/* 装饰画框 - 后墙 */}
      <group position={[2, 2.5, -4.95]}>
        <RoundedBox args={[1.2, 0.9, 0.05]} radius={0.02}>
          <meshStandardMaterial color="#3d3d3d" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1, 0.7]} />
          <meshStandardMaterial color="#87CEEB" roughness={0.3} />
        </mesh>
      </group>
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
    type?: 'sofa' | 'table' | 'lamp' | 'shelf' | 'plant' | 'rug' | 'chair' | 'bed' | 'default'
  }>
  onFurnitureSelect?: (id: string) => void
  selectedFurnitureId?: string | null
}

export function RoomScene({ 
  furniture = [], 
  onFurnitureSelect,
  selectedFurnitureId 
}: RoomSceneProps) {
  // Default furniture if none provided - 使用真实的3D模型类型
  const defaultFurniture = [
    { id: 'sofa', name: '沙发', type: 'sofa' as const, position: [0, 0, -2.5] as [number, number, number], size: [2.4, 0.9, 1.0] as [number, number, number], color: '#E8DED1' },
    { id: 'table', name: '茶几', type: 'table' as const, position: [0, 0, -0.5] as [number, number, number], size: [1.2, 0.45, 0.7] as [number, number, number], color: '#D4A574' },
    { id: 'lamp', name: '落地灯', type: 'lamp' as const, position: [2.5, 0, -3] as [number, number, number], size: [0.4, 1.6, 0.4] as [number, number, number], color: '#FEFEFE' },
    { id: 'shelf', name: '书架', type: 'shelf' as const, position: [-3.5, 0, -4.5] as [number, number, number], size: [1.2, 2.0, 0.35] as [number, number, number], color: '#8B7355' },
    { id: 'plant', name: '绿植', type: 'plant' as const, position: [3.5, 0, -4] as [number, number, number], size: [0.5, 1.0, 0.5] as [number, number, number], color: '#6B8E6B' },
    { id: 'rug', name: '地毯', type: 'rug' as const, position: [0, 0, -1.5] as [number, number, number], size: [3.5, 0.02, 2.5] as [number, number, number], color: '#C9B896' },
    { id: 'chair1', name: '单人椅', type: 'chair' as const, position: [-1.8, 0, 0.5] as [number, number, number], size: [0.6, 0.9, 0.6] as [number, number, number], color: '#8B9A6B' },
    { id: 'chair2', name: '单人椅', type: 'chair' as const, position: [1.8, 0, 0.5] as [number, number, number], size: [0.6, 0.9, 0.6] as [number, number, number], color: '#8B9A6B' },
    { id: 'plant2', name: '小盆栽', type: 'plant' as const, position: [-2.5, 0, -3.5] as [number, number, number], size: [0.35, 0.6, 0.35] as [number, number, number], color: '#228B22' },
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
              type={item.type || 'default'}
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

