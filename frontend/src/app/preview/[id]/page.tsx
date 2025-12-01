'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Box, 
  ShoppingCart, 
  Download, 
  Share2,
  Smartphone,
  Heart,
  Eye,
  Layers,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Room3DPreview } from '@/components/3d'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'

// Mock design data
const mockDesign = {
  id: 'design-1',
  name: '北欧阳光客厅',
  description: '明亮通透的北欧风格，让自然光成为主角，打造温馨舒适的家居空间',
  style: '北欧风格',
  totalCost: 8500,
  confidence: 0.95,
  colors: ['#FEFEFE', '#E8DED1', '#6B8E6B', '#D4A574'],
  highlights: ['自然采光', '原木质感', '温暖织物'],
  furniture: [
    { id: 'f1', name: '北欧布艺沙发', price: 3200, brand: 'IKEA', position: [0, 0.4, -2] as [number, number, number], size: [2.2, 0.8, 0.9] as [number, number, number], color: '#E8DED1' },
    { id: 'f2', name: '原木茶几', price: 1200, brand: '源氏木语', position: [0, 0.25, 0] as [number, number, number], size: [1.2, 0.5, 0.6] as [number, number, number], color: '#D4A574' },
    { id: 'f3', name: '北欧落地灯', price: 680, brand: 'MUJI', position: [2, 0.8, -2] as [number, number, number], size: [0.4, 1.6, 0.4] as [number, number, number], color: '#FEFEFE' },
    { id: 'f4', name: '开放式书架', price: 1800, brand: 'IKEA', position: [-3, 1, -4.5] as [number, number, number], size: [1.5, 2, 0.3] as [number, number, number], color: '#8B7355' },
    { id: 'f5', name: '仿真绿植', price: 180, brand: 'IKEA', position: [3, 0.5, -3] as [number, number, number], size: [0.5, 1, 0.5] as [number, number, number], color: '#6B8E6B' },
    { id: 'f6', name: '羊毛地毯', price: 1500, brand: 'MUJI', position: [0, 0.02, -0.5] as [number, number, number], size: [3, 0.02, 2] as [number, number, number], color: '#C9B896' },
  ],
}

export default function PreviewPage() {
  const params = useParams()
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'3d' | 'ar'>('3d')
  const [isFavorite, setIsFavorite] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const selectedFurniture = mockDesign.furniture.find(f => f.id === selectedFurnitureId)

  const handleAddToCart = (item: typeof mockDesign.furniture[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      brand: item.brand,
    })
  }

  const handleAddAllToCart = () => {
    mockDesign.furniture.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        brand: item.brand,
      })
    })
  }

  return (
    <div className="min-h-screen bg-warmgray-50">
      <Header />
      
      <main className="pt-24">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 py-4">
          <Link href="/design" className="inline-flex items-center gap-2 text-warmgray-500 hover:text-terracotta-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回设计方案
          </Link>
        </div>

        <div className="container mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 3D Preview */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === '3d'
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
                  }`}
                >
                  <Box className="w-5 h-5" />
                  3D预览
                </button>
                <button
                  onClick={() => setActiveTab('ar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'ar'
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  AR体验
                </button>
              </div>

              {/* Preview area */}
              {activeTab === '3d' ? (
                <Room3DPreview
                  furniture={mockDesign.furniture}
                  onFurnitureSelect={setSelectedFurnitureId}
                  className="h-[500px] lg:h-[600px]"
                />
              ) : (
                <div className="h-[500px] lg:h-[600px] bg-white rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-terracotta-100 to-forest-100 rounded-full flex items-center justify-center mb-6">
                      <Smartphone className="w-10 h-10 text-terracotta-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AR体验</h3>
                    <p className="text-warmgray-600 mb-6 max-w-sm">
                      使用手机扫描下方二维码，在真实空间中预览家具效果
                    </p>
                    <div className="w-48 h-48 mx-auto bg-warmgray-100 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-warmgray-400">AR二维码</span>
                    </div>
                    <p className="text-sm text-warmgray-500">
                      需要支持ARKit/ARCore的设备
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Design info sidebar */}
            <div className="space-y-6">
              {/* Design header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{mockDesign.name}</h1>
                    <p className="text-warmgray-500">{mockDesign.style}</p>
                  </div>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite ? 'bg-red-50 text-red-500' : 'bg-warmgray-100 text-warmgray-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <p className="text-warmgray-600 mb-4">{mockDesign.description}</p>

                {/* Color palette */}
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-5 h-5 text-warmgray-400" />
                  <div className="flex gap-1">
                    {mockDesign.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-warmgray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mockDesign.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-forest-50 text-forest-700 rounded-full text-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-warmgray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-warmgray-500">预估总价</p>
                    <p className="text-xl font-bold text-terracotta-600">
                      {formatCurrency(mockDesign.totalCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-warmgray-500">AI匹配度</p>
                    <p className="text-xl font-bold text-forest-600">
                      {Math.round(mockDesign.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Furniture list */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-terracotta-500" />
                    家具清单
                  </h2>
                  <span className="text-sm text-warmgray-500">
                    {mockDesign.furniture.length} 件
                  </span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {mockDesign.furniture.map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedFurnitureId(item.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedFurnitureId === item.id
                          ? 'bg-terracotta-50 ring-2 ring-terracotta-500'
                          : 'bg-warmgray-50 hover:bg-warmgray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-warmgray-900 truncate">{item.name}</p>
                          <p className="text-sm text-warmgray-500">{item.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-terracotta-600">
                            {formatCurrency(item.price)}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(item)
                            }}
                            className="text-xs text-ocean-600 hover:text-ocean-700"
                          >
                            加入清单
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-warmgray-100 space-y-3">
                  <button
                    onClick={handleAddAllToCart}
                    className="btn-primary w-full justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    全部加入购物清单
                  </button>
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1 justify-center">
                      <Download className="w-5 h-5 mr-2" />
                      下载
                    </button>
                    <button className="btn-secondary flex-1 justify-center">
                      <Share2 className="w-5 h-5 mr-2" />
                      分享
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

