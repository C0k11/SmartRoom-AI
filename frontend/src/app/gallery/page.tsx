'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Heart,
  Eye,
  ArrowRight,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const styles = [
  { id: 'all', name: '全部' },
  { id: 'modern', name: '现代简约' },
  { id: 'nordic', name: '北欧' },
  { id: 'japanese', name: '日式' },
  { id: 'industrial', name: '工业风' },
  { id: 'bohemian', name: '波西米亚' },
  { id: 'coastal', name: '海岸风' },
]

const roomTypes = [
  { id: 'all', name: '全部房间' },
  { id: 'living', name: '客厅' },
  { id: 'bedroom', name: '卧室' },
  { id: 'kitchen', name: '厨房' },
  { id: 'office', name: '书房' },
  { id: 'bathroom', name: '卫生间' },
]

// Mock gallery data
const galleryItems = [
  {
    id: '1',
    title: '北欧阳光客厅',
    style: 'nordic',
    roomType: 'living',
    image: null,
    colors: ['#FEFEFE', '#E8DED1', '#6B8E6B', '#D4A574'],
    likes: 234,
    views: 1520,
  },
  {
    id: '2',
    title: '日式禅意卧室',
    style: 'japanese',
    roomType: 'bedroom',
    image: null,
    colors: ['#F5F1EB', '#3D3D3D', '#8B9A6B', '#C9B896'],
    likes: 189,
    views: 980,
  },
  {
    id: '3',
    title: '工业风开放厨房',
    style: 'industrial',
    roomType: 'kitchen',
    image: null,
    colors: ['#4A4A4A', '#8B4513', '#2F2F2F', '#C9C9C9'],
    likes: 156,
    views: 870,
  },
  {
    id: '4',
    title: '现代简约书房',
    style: 'modern',
    roomType: 'office',
    image: null,
    colors: ['#FFFFFF', '#1A1A1A', '#C4C4C4', '#8B7355'],
    likes: 312,
    views: 1890,
  },
  {
    id: '5',
    title: '波西米亚客厅',
    style: 'bohemian',
    roomType: 'living',
    image: null,
    colors: ['#D2691E', '#8B4513', '#228B22', '#4169E1'],
    likes: 267,
    views: 1340,
  },
  {
    id: '6',
    title: '海岸风主卧',
    style: 'coastal',
    roomType: 'bedroom',
    image: null,
    colors: ['#FFFFFF', '#87CEEB', '#F5DEB3', '#4682B4'],
    likes: 198,
    views: 1120,
  },
  {
    id: '7',
    title: '北欧温馨书房',
    style: 'nordic',
    roomType: 'office',
    image: null,
    colors: ['#F5F5F0', '#B8A698', '#5D7A6A', '#D4C4B4'],
    likes: 145,
    views: 780,
  },
  {
    id: '8',
    title: '现代极简客厅',
    style: 'modern',
    roomType: 'living',
    image: null,
    colors: ['#F8F8F8', '#2D2D2D', '#A0A0A0', '#B8956B'],
    likes: 423,
    views: 2340,
  },
]

export default function GalleryPage() {
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredItems = galleryItems.filter(item => {
    const matchesStyle = selectedStyle === 'all' || item.style === selectedStyle
    const matchesRoom = selectedRoomType === 'all' || item.roomType === selectedRoomType
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStyle && matchesRoom && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-warmgray-50">
      <Header />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold mb-4"
            >
              设计灵感库
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-warmgray-600 max-w-2xl mx-auto"
            >
              浏览我们精选的AI生成设计案例，找到适合您家的风格灵感
            </motion.p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warmgray-400" />
                <input
                  type="text"
                  placeholder="搜索设计案例..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-primary pl-12"
                />
              </div>

              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden btn-secondary flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                筛选
              </button>

              {/* Style filters (desktop) */}
              <div className="hidden md:flex items-center gap-2 flex-wrap">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedStyle === style.id
                        ? 'bg-terracotta-500 text-white'
                        : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 p-4 bg-white rounded-xl shadow-sm"
              >
                <div className="mb-4">
                  <h4 className="font-medium mb-2">设计风格</h4>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedStyle === style.id
                            ? 'bg-terracotta-500 text-white'
                            : 'bg-warmgray-100 text-warmgray-600'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">房间类型</h4>
                  <div className="flex flex-wrap gap-2">
                    {roomTypes.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoomType(room.id)}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedRoomType === room.id
                            ? 'bg-forest-500 text-white'
                            : 'bg-warmgray-100 text-warmgray-600'
                        }`}
                      >
                        {room.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Room type filter (desktop) */}
            <div className="hidden md:flex items-center gap-2 mt-4">
              {roomTypes.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomType(room.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedRoomType === room.id
                      ? 'bg-forest-500 text-white'
                      : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 text-warmgray-500">
            找到 {filteredItems.length} 个设计案例
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-elevated transition-all duration-300"
              >
                {/* Image placeholder with gradient */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.colors[0]} 0%, ${item.colors[1]} 50%, ${item.colors[2]} 100%)`,
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button className="p-3 bg-white rounded-full text-warmgray-800 hover:bg-terracotta-500 hover:text-white transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white rounded-full text-warmgray-800 hover:bg-red-500 hover:text-white transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-warmgray-900 mb-2 group-hover:text-terracotta-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    {item.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-warmgray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-warmgray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.views}
                      </span>
                    </div>
                    <Link 
                      href={`/gallery/${item.id}`}
                      className="text-terracotta-600 hover:text-terracotta-700 font-medium flex items-center gap-1"
                    >
                      查看
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-warmgray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-warmgray-400" />
              </div>
              <h3 className="text-xl font-semibold text-warmgray-700 mb-2">
                没有找到匹配的设计
              </h3>
              <p className="text-warmgray-500 mb-4">
                尝试调整筛选条件或搜索关键词
              </p>
              <button
                onClick={() => {
                  setSelectedStyle('all')
                  setSelectedRoomType('all')
                  setSearchQuery('')
                }}
                className="btn-secondary"
              >
                清除筛选
              </button>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-terracotta-500 to-forest-600 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                想要属于自己的设计方案？
              </h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto">
                上传您的房间照片，AI将为您生成专属的设计方案
              </p>
              <Link
                href="/design"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-terracotta-600 font-semibold rounded-xl hover:shadow-xl transition-all"
              >
                开始设计
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

