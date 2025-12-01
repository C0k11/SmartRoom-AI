'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Eye,
  Move,
  Box,
  Layers,
  Info
} from 'lucide-react'

// Dynamic import for Three.js scene (client-side only)
const RoomScene = dynamic(
  () => import('./RoomScene').then(mod => mod.RoomScene),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-warmgray-100 rounded-2xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warmgray-600">加载3D场景...</p>
        </div>
      </div>
    )
  }
)

interface FurnitureItem {
  id: string
  name: string
  price: number
  position: [number, number, number]
  size: [number, number, number]
  color: string
}

interface Room3DPreviewProps {
  furniture?: FurnitureItem[]
  onFurnitureSelect?: (id: string) => void
  className?: string
}

export function Room3DPreview({ 
  furniture = [], 
  onFurnitureSelect,
  className = ''
}: Room3DPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(true)

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id)
    onFurnitureSelect?.(id)
  }

  const selectedItem = furniture.find(f => f.id === selectedId)

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-warmgray-900' : ''} ${className}`}>
      {/* 3D Scene */}
      <div className={`${isFullscreen ? 'h-full' : 'h-[500px]'} w-full`}>
        <RoomScene 
          furniture={furniture}
          onFurnitureSelect={handleSelect}
          selectedFurnitureId={selectedId}
        />
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white/90 rounded-lg shadow-md hover:bg-white transition-colors"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-warmgray-700" />
          ) : (
            <Maximize2 className="w-5 h-5 text-warmgray-700" />
          )}
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-lg shadow-md transition-colors ${
            showInfo ? 'bg-terracotta-500 text-white' : 'bg-white/90 text-warmgray-700 hover:bg-white'
          }`}
          title="显示信息"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Controls hint */}
      {showInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-xs"
        >
          <h4 className="font-semibold text-warmgray-900 mb-3">操作指南</h4>
          <div className="space-y-2 text-sm text-warmgray-600">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              <span>拖动旋转视角</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span>滚轮缩放</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>右键平移</span>
            </div>
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              <span>点击家具查看详情</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected furniture info */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: selectedItem.color }}
            />
            <div>
              <h4 className="font-semibold text-warmgray-900">{selectedItem.name}</h4>
              <p className="text-terracotta-600 font-medium">
                ¥{selectedItem.price.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-sm text-warmgray-500">
            尺寸: {selectedItem.size[0]}×{selectedItem.size[2]}×{selectedItem.size[1]}m
          </div>
        </motion.div>
      )}

      {/* Furniture list sidebar (fullscreen mode) */}
      {isFullscreen && furniture.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-20 bottom-4 w-64 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 border-b border-warmgray-200">
            <h4 className="font-semibold text-warmgray-900 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              家具列表
            </h4>
          </div>
          <div className="p-2 overflow-y-auto max-h-[calc(100%-60px)]">
            {furniture.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                  selectedId === item.id
                    ? 'bg-terracotta-50 border border-terracotta-200'
                    : 'hover:bg-warmgray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-warmgray-900 truncate">{item.name}</p>
                    <p className="text-sm text-warmgray-500">¥{item.price.toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

