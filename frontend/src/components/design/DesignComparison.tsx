'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Check, 
  Heart, 
  ShoppingCart,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

interface DesignProposal {
  id: string
  name: string
  description: string
  style: string
  confidence: number
  totalCost: number
  highlights: string[]
  colors: string[]
  furniture: Array<{
    id: string
    name: string
    price: number
    brand: string
  }>
}

interface DesignComparisonProps {
  designs: DesignProposal[]
  onSelect: (design: DesignProposal) => void
  onClose: () => void
}

export function DesignComparison({ designs, onSelect, onClose }: DesignComparisonProps) {
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>(
    designs.slice(0, 2).map(d => d.id)
  )
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  const toggleDesign = (id: string) => {
    if (selectedDesigns.includes(id)) {
      if (selectedDesigns.length > 1) {
        setSelectedDesigns(prev => prev.filter(d => d !== id))
      }
    } else {
      if (selectedDesigns.length < 3) {
        setSelectedDesigns(prev => [...prev, id])
      } else {
        setSelectedDesigns(prev => [...prev.slice(1), id])
      }
    }
  }

  const comparedDesigns = designs.filter(d => selectedDesigns.includes(d.id))

  const handleAddAllToCart = (design: DesignProposal) => {
    design.furniture.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        brand: item.brand,
      })
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-warmgray-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-warmgray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-6 h-6 text-terracotta-500" />
            <h2 className="text-xl font-bold">方案对比</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-warmgray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-warmgray-500" />
          </button>
        </div>

        {/* Design selector */}
        <div className="p-4 border-b border-warmgray-100 bg-warmgray-50">
          <p className="text-sm text-warmgray-500 mb-3">选择要对比的方案（最多3个）：</p>
          <div className="flex flex-wrap gap-2">
            {designs.map((design) => (
              <button
                key={design.id}
                onClick={() => toggleDesign(design.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDesigns.includes(design.id)
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-white text-warmgray-600 border border-warmgray-200 hover:border-terracotta-300'
                }`}
              >
                {design.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="flex-1 overflow-auto p-6">
          <div className={`grid gap-6 ${
            comparedDesigns.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            comparedDesigns.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {comparedDesigns.map((design) => (
              <div
                key={design.id}
                className={`rounded-2xl border-2 transition-all ${
                  favoriteId === design.id
                    ? 'border-terracotta-500 shadow-lg shadow-terracotta-500/20'
                    : 'border-warmgray-200'
                }`}
              >
                {/* Design preview */}
                <div 
                  className="h-40 rounded-t-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${design.colors[0]} 0%, ${design.colors[1]} 50%, ${design.colors[2]} 100%)`,
                  }}
                >
                  {favoriteId === design.id && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-terracotta-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" />
                      已选中
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-sm rounded-lg">
                    匹配度 {Math.round(design.confidence * 100)}%
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{design.name}</h3>
                  <p className="text-sm text-warmgray-500 mb-4">{design.style}</p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-warmgray-50 rounded-lg">
                    <span className="text-warmgray-600">预估总价</span>
                    <span className="text-xl font-bold text-terracotta-600">
                      {formatCurrency(design.totalCost)}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-warmgray-700 mb-2">设计亮点</h4>
                    <div className="flex flex-wrap gap-1">
                      {design.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-forest-50 text-forest-700 text-xs rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Furniture count */}
                  <div className="mb-4 text-sm text-warmgray-600">
                    包含 {design.furniture.length} 件家具
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFavoriteId(design.id)}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                        favoriteId === design.id
                          ? 'bg-terracotta-500 text-white'
                          : 'bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favoriteId === design.id ? 'fill-white' : ''}`} />
                      选择
                    </button>
                    <button
                      onClick={() => handleAddAllToCart(design)}
                      className="flex-1 py-2 rounded-lg font-medium bg-forest-500 text-white hover:bg-forest-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      加入清单
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison details */}
          {comparedDesigns.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-terracotta-500" />
                详细对比
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warmgray-200">
                      <th className="text-left py-3 px-4 text-warmgray-500 font-medium">对比项</th>
                      {comparedDesigns.map((design) => (
                        <th key={design.id} className="text-left py-3 px-4 font-semibold">
                          {design.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-warmgray-100">
                      <td className="py-3 px-4 text-warmgray-500">风格</td>
                      {comparedDesigns.map((design) => (
                        <td key={design.id} className="py-3 px-4">{design.style}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-warmgray-100">
                      <td className="py-3 px-4 text-warmgray-500">总价</td>
                      {comparedDesigns.map((design) => (
                        <td key={design.id} className="py-3 px-4 font-semibold text-terracotta-600">
                          {formatCurrency(design.totalCost)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-warmgray-100">
                      <td className="py-3 px-4 text-warmgray-500">家具数量</td>
                      {comparedDesigns.map((design) => (
                        <td key={design.id} className="py-3 px-4">{design.furniture.length} 件</td>
                      ))}
                    </tr>
                    <tr className="border-b border-warmgray-100">
                      <td className="py-3 px-4 text-warmgray-500">AI匹配度</td>
                      {comparedDesigns.map((design) => (
                        <td key={design.id} className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-warmgray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-forest-500 rounded-full"
                                style={{ width: `${design.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round(design.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-warmgray-100 bg-warmgray-50 flex justify-between items-center">
          <button onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button
            onClick={() => {
              const selected = designs.find(d => d.id === favoriteId) || comparedDesigns[0]
              onSelect(selected)
            }}
            disabled={!favoriteId && comparedDesigns.length === 0}
            className="btn-primary"
          >
            <Check className="w-5 h-5 mr-2" />
            确认选择
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

