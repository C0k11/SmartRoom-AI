'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Heart,
  ShoppingCart,
  Star,
  ExternalLink,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'

const categories = [
  { id: 'all', name: '全部', nameEn: 'All' },
  { id: 'sofa', name: '沙发', nameEn: 'Sofa' },
  { id: 'table', name: '桌子', nameEn: 'Table' },
  { id: 'chair', name: '椅子', nameEn: 'Chair' },
  { id: 'bed', name: '床', nameEn: 'Bed' },
  { id: 'storage', name: '收纳', nameEn: 'Storage' },
  { id: 'lighting', name: '灯具', nameEn: 'Lighting' },
  { id: 'decor', name: '装饰', nameEn: 'Decor' },
  { id: 'rug', name: '地毯', nameEn: 'Rug' },
]

const styles = [
  { id: 'all', name: '全部风格', nameEn: 'All Styles' },
  { id: 'modern', name: '现代简约', nameEn: 'Modern' },
  { id: 'nordic', name: '北欧', nameEn: 'Nordic' },
  { id: 'japanese', name: '日式', nameEn: 'Japanese' },
  { id: 'industrial', name: '工业风', nameEn: 'Industrial' },
  { id: 'bohemian', name: '波西米亚', nameEn: 'Bohemian' },
]

const brands = [
  { id: 'all', name: '全部品牌', nameEn: 'All Brands' },
  { id: 'ikea', name: 'IKEA', nameEn: 'IKEA' },
  { id: 'muji', name: 'MUJI', nameEn: 'MUJI' },
  { id: 'hay', name: 'HAY', nameEn: 'HAY' },
  { id: 'yuanshimuyu', name: '源氏木语', nameEn: 'Yuanshi Wood' },
  { id: 'muzhigongfang', name: '木智工坊', nameEn: 'Muzhi Studio' },
]

// Mock furniture data
const mockFurniture = [
  {
    id: 'f1',
    name: '北欧布艺三人沙发',
    category: 'sofa',
    price: 3200,
    originalPrice: 3999,
    image: null,
    brand: 'IKEA',
    style: ['nordic', 'modern'],
    colors: ['#E8DED1', '#6B8E6B', '#D4A574'],
    rating: 4.5,
    reviews: 1234,
    dimensions: '220×85×80cm',
    inStock: true,
  },
  {
    id: 'f2',
    name: '日式棉麻沙发',
    category: 'sofa',
    price: 2800,
    originalPrice: null,
    image: null,
    brand: 'MUJI',
    style: ['japanese', 'nordic'],
    colors: ['#F5F1EB', '#C9B896', '#3D3D3D'],
    rating: 4.7,
    reviews: 856,
    dimensions: '200×90×35cm',
    inStock: true,
  },
  {
    id: 'f3',
    name: '原木茶几',
    category: 'table',
    price: 1200,
    originalPrice: 1500,
    image: null,
    brand: '源氏木语',
    style: ['nordic', 'japanese'],
    colors: ['#D4A574', '#8B7355', '#F5F5DC'],
    rating: 4.8,
    reviews: 2341,
    dimensions: '120×60×45cm',
    inStock: true,
  },
  {
    id: 'f4',
    name: '大理石茶几',
    category: 'table',
    price: 2400,
    originalPrice: null,
    image: null,
    brand: 'HAY',
    style: ['modern'],
    colors: ['#FFFFFF', '#C4C4C4', '#1A1A1A'],
    rating: 4.6,
    reviews: 567,
    dimensions: '100×50×40cm',
    inStock: true,
  },
  {
    id: 'f5',
    name: '北欧落地灯',
    category: 'lighting',
    price: 680,
    originalPrice: 899,
    image: null,
    brand: 'MUJI',
    style: ['nordic', 'modern', 'japanese'],
    colors: ['#FEFEFE', '#E8DED1', '#3D3D3D'],
    rating: 4.4,
    reviews: 789,
    dimensions: 'H160cm',
    inStock: true,
  },
  {
    id: 'f6',
    name: '日式纸灯笼吊灯',
    category: 'lighting',
    price: 520,
    originalPrice: null,
    image: null,
    brand: 'Noguchi',
    style: ['japanese'],
    colors: ['#FFFAF0', '#F5F1EB', '#C9B896'],
    rating: 4.9,
    reviews: 423,
    dimensions: 'D45cm',
    inStock: false,
  },
  {
    id: 'f7',
    name: '羊毛编织地毯',
    category: 'rug',
    price: 1500,
    originalPrice: 1800,
    image: null,
    brand: 'MUJI',
    style: ['nordic', 'japanese'],
    colors: ['#E8DED1', '#C9B896', '#8B9A6B'],
    rating: 4.7,
    reviews: 654,
    dimensions: '200×140cm',
    inStock: true,
  },
  {
    id: 'f8',
    name: '开放式书架',
    category: 'storage',
    price: 1800,
    originalPrice: null,
    image: null,
    brand: 'IKEA',
    style: ['nordic', 'modern', 'industrial'],
    colors: ['#FEFEFE', '#1A1A1A', '#8B7355'],
    rating: 4.5,
    reviews: 1567,
    dimensions: '180×80×30cm',
    inStock: true,
  },
  {
    id: 'f9',
    name: '北欧风装饰画',
    category: 'decor',
    price: 420,
    originalPrice: 520,
    image: null,
    brand: '艺术家原创',
    style: ['nordic', 'modern'],
    colors: ['#87CEEB', '#F5DEB3', '#2F4F4F'],
    rating: 4.6,
    reviews: 234,
    dimensions: '80×60cm',
    inStock: true,
  },
  {
    id: 'f10',
    name: '仿真绿植盆栽',
    category: 'decor',
    price: 180,
    originalPrice: null,
    image: null,
    brand: 'IKEA',
    style: ['nordic', 'modern', 'japanese', 'industrial'],
    colors: ['#228B22', '#6B8E6B', '#8B9A6B'],
    rating: 4.3,
    reviews: 3456,
    dimensions: 'H120cm',
    inStock: true,
  },
  {
    id: 'f11',
    name: '工业风铁艺茶几',
    category: 'table',
    price: 1800,
    originalPrice: 2200,
    image: null,
    brand: '工业记忆',
    style: ['industrial'],
    colors: ['#4A4A4A', '#8B4513', '#2F2F2F'],
    rating: 4.5,
    reviews: 432,
    dimensions: '130×70×45cm',
    inStock: true,
  },
  {
    id: 'f12',
    name: '复古皮质沙发',
    category: 'sofa',
    price: 4500,
    originalPrice: 5500,
    image: null,
    brand: 'HAY',
    style: ['industrial', 'midcentury'],
    colors: ['#8B4513', '#4A4A4A', '#D2691E'],
    rating: 4.8,
    reviews: 321,
    dimensions: '240×95×85cm',
    inStock: true,
  },
]

export default function FurniturePage() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  const texts = {
    zh: {
      title: '家具商城',
      subtitle: '精选高品质家具，让设计方案变为现实',
      search: '搜索家具名称、品牌...',
      filter: '筛选',
      style: '风格',
      brand: '品牌',
      priceRange: '价格范围',
      found: '找到',
      items: '件商品',
      outOfStock: '缺货',
      addToList: '加入清单',
      dimensions: '尺寸',
      noResults: '没有找到匹配的商品',
      tryAdjust: '尝试调整筛选条件或搜索关键词',
      clearFilter: '清除筛选',
      popular: '最受欢迎',
      priceLow: '价格从低到高',
      priceHigh: '价格从高到低',
      topRated: '评分最高',
      mostReviews: '评论最多',
    },
    en: {
      title: 'Furniture Store',
      subtitle: 'Quality furniture to bring your designs to life',
      search: 'Search furniture, brands...',
      filter: 'Filter',
      style: 'Style',
      brand: 'Brand',
      priceRange: 'Price Range',
      found: 'Found',
      items: 'items',
      outOfStock: 'Out of Stock',
      addToList: 'Add to List',
      dimensions: 'Size',
      noResults: 'No matching products found',
      tryAdjust: 'Try adjusting filters or search keywords',
      clearFilter: 'Clear Filters',
      popular: 'Most Popular',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      topRated: 'Top Rated',
      mostReviews: 'Most Reviews',
    }
  }
  const txt = texts[language]

  const filteredFurniture = mockFurniture.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesStyle = selectedStyle === 'all' || item.style.includes(selectedStyle)
    const matchesBrand = selectedBrand === 'all' || item.brand.toLowerCase().includes(selectedBrand)
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1]
    
    return matchesSearch && matchesCategory && matchesStyle && matchesBrand && matchesPrice
  })

  // Sort
  const sortedFurniture = [...filteredFurniture].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'reviews':
        return b.reviews - a.reviews
      default:
        return b.reviews - a.reviews // popular
    }
  })

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-warmgray-50">
      <Header />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold mb-4"
            >
              {txt.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-warmgray-600"
            >
              {txt.subtitle}
            </motion.p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warmgray-400" />
                <input
                  type="text"
                  placeholder={txt.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-primary pl-12"
                />
              </div>

              {/* Filter toggles */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-primary pr-10 appearance-none bg-no-repeat bg-right"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5rem' }}
                >
                  <option value="popular">{txt.popular}</option>
                  <option value="price-low">{txt.priceLow}</option>
                  <option value="price-high">{txt.priceHigh}</option>
                  <option value="rating">{txt.topRated}</option>
                  <option value="reviews">{txt.mostReviews}</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-terracotta-50 text-terracotta-600' : ''}`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {txt.filter}
                </button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-warmgray-100"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">{txt.style}</label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="input-primary"
                    >
                      {styles.map(style => (
                        <option key={style.id} value={style.id}>{language === 'zh' ? style.name : style.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">{txt.brand}</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="input-primary"
                    >
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{language === 'zh' ? brand.name : brand.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warmgray-700 mb-2">
                      {txt.priceRange}: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-warmgray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-white text-warmgray-600 hover:bg-warmgray-100'
                }`}
              >
                <span>{language === 'zh' ? category.name : category.nameEn}</span>
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="text-warmgray-500 mb-6">
            {txt.found} {sortedFurniture.length} {txt.items}
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFurniture.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-elevated transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.colors[0]} 0%, ${item.colors[1]} 50%, ${item.colors[2]} 100%)`,
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.originalPrice && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                      </span>
                    )}
                    {!item.inStock && (
                      <span className="px-2 py-1 bg-warmgray-500 text-white text-xs font-medium rounded-full">
                        {txt.outOfStock}
                      </span>
                    )}
                  </div>
                  
                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        favorites.includes(item.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-warmgray-500'
                      }`} 
                    />
                  </button>

                  {/* Quick actions */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 py-2 bg-terracotta-500 text-white text-sm font-medium rounded-lg hover:bg-terracotta-600 transition-colors flex items-center justify-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      {txt.addToList}
                    </button>
                    <a
                      href="#"
                      target="_blank"
                      className="py-2 px-3 bg-white text-warmgray-700 text-sm font-medium rounded-lg hover:bg-warmgray-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-xs text-warmgray-500 mb-1">{item.brand}</div>
                  <h3 className="font-semibold text-warmgray-900 mb-2 line-clamp-2 group-hover:text-terracotta-600 transition-colors">
                    {item.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <span className="text-sm text-warmgray-400">({item.reviews})</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-terracotta-600">
                      {formatCurrency(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-warmgray-400 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {/* Dimensions */}
                  <div className="text-xs text-warmgray-500 mt-2">
                    {txt.dimensions}: {item.dimensions}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {sortedFurniture.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-warmgray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-warmgray-400" />
              </div>
              <h3 className="text-xl font-semibold text-warmgray-700 mb-2">
                {txt.noResults}
              </h3>
              <p className="text-warmgray-500 mb-4">
                {txt.tryAdjust}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedStyle('all')
                  setSelectedBrand('all')
                  setPriceRange([0, 10000])
                }}
                className="btn-secondary"
              >
                {txt.clearFilter}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

