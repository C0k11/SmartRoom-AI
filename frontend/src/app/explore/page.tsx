'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const designStyles = [
  {
    id: 'modern',
    name: '现代简约',
    nameEn: 'Modern Minimalist',
    description: '简洁线条、功能至上、中性色调。现代简约风格追求"少即是多"的设计理念，通过精简的元素和高品质的材料创造优雅空间。',
    characteristics: ['简洁线条', '中性色调', '功能性设计', '高品质材料', '开放空间'],
    colors: ['#FFFFFF', '#1A1A1A', '#C4C4C4', '#8B7355', '#F5F5F5'],
    materials: ['大理石', '金属', '玻璃', '混凝土'],
    bestFor: ['都市公寓', '办公空间', '追求效率的生活方式'],
    image: '/styles/modern-detail.jpg',
  },
  {
    id: 'nordic',
    name: '北欧风格',
    nameEn: 'Scandinavian',
    description: '源自斯堪的纳维亚的设计哲学，强调自然光、温暖木质和舒适的Hygge生活美学。打造明亮、温馨、与自然和谐共处的居住空间。',
    characteristics: ['自然采光', '原木质感', '温暖织物', '绿植点缀', '功能美学'],
    colors: ['#FEFEFE', '#E8DED1', '#6B8E6B', '#D4A574', '#F0EDE8'],
    materials: ['橡木', '松木', '亚麻', '羊毛', '陶瓷'],
    bestFor: ['家庭住宅', '需要温馨氛围', '喜爱自然元素'],
    image: '/styles/nordic-detail.jpg',
  },
  {
    id: 'japanese',
    name: '日式禅风',
    nameEn: 'Japanese Zen',
    description: '融合日本传统美学与禅宗哲学，追求"侘寂"之美。通过极简主义、自然材质和留白艺术，创造宁静致远的冥想空间。',
    characteristics: ['极简主义', '自然素材', '留白艺术', '低矮家具', '和纸障子'],
    colors: ['#F5F1EB', '#3D3D3D', '#8B9A6B', '#C9B896', '#E8E4DC'],
    materials: ['竹子', '和纸', '榻榻米', '原木', '石材'],
    bestFor: ['追求内心平静', '冥想空间', '茶室书房'],
    image: '/styles/japanese-detail.jpg',
  },
  {
    id: 'industrial',
    name: '工业风格',
    nameEn: 'Industrial',
    description: '灵感来自纽约LOFT和旧工厂改造，展现裸露材质的粗犷美感。金属管道、砖墙、混凝土共同构建个性鲜明的都市空间。',
    characteristics: ['裸露材质', '金属元素', '高挑空间', '复古灯具', '开放管线'],
    colors: ['#4A4A4A', '#8B4513', '#2F2F2F', '#C9C9C9', '#6B5B4F'],
    materials: ['铁艺', '红砖', '水泥', '皮革', '回收木'],
    bestFor: ['LOFT公寓', '工作室', '创意空间'],
    image: '/styles/industrial-detail.jpg',
  },
  {
    id: 'bohemian',
    name: '波西米亚',
    nameEn: 'Bohemian',
    description: '自由不羁的艺术灵魂，融合世界各地的文化元素。色彩丰富的纺织品、手工艺品和绿植共同创造充满生命力的空间。',
    characteristics: ['丰富色彩', '混搭文化', '手工艺品', '层叠织物', '绿植丛林'],
    colors: ['#D2691E', '#8B4513', '#228B22', '#4169E1', '#DAA520'],
    materials: ['棉麻', '藤编', '流苏', '地毯', '陶土'],
    bestFor: ['艺术家住所', '喜爱旅行者', '个性表达'],
    image: '/styles/bohemian-detail.jpg',
  },
  {
    id: 'midcentury',
    name: '中古世纪',
    nameEn: 'Mid-Century Modern',
    description: '致敬20世纪中期的黄金设计时代，有机曲线与几何形态的完美结合。经典家具设计与复古配色诠释永不过时的优雅。',
    characteristics: ['有机曲线', '锥形腿', '几何图案', '复古配色', '功能主义'],
    colors: ['#DAA520', '#2F4F4F', '#CD853F', '#F4A460', '#8B4513'],
    materials: ['胡桃木', '柚木', '黄铜', '天鹅绒', '皮革'],
    bestFor: ['设计爱好者', '复古品味', '经典永恒'],
    image: '/styles/midcentury-detail.jpg',
  },
  {
    id: 'coastal',
    name: '海岸风格',
    nameEn: 'Coastal',
    description: '将海洋的清新与宁静带入室内，蓝白配色搭配自然纹理，营造永恒度假的轻松氛围。仿佛时刻聆听海浪声。',
    characteristics: ['蓝白配色', '自然纹理', '贝壳元素', '通透明亮', '度假氛围'],
    colors: ['#FFFFFF', '#87CEEB', '#F5DEB3', '#4682B4', '#E0E8E4'],
    materials: ['亚麻', '棉布', '藤编', '贝壳', '漂流木'],
    bestFor: ['海边住宅', '度假屋', '追求放松'],
    image: '/styles/coastal-detail.jpg',
  },
  {
    id: 'farmhouse',
    name: '现代农舍',
    nameEn: 'Modern Farmhouse',
    description: '将乡村的温暖与现代的简洁完美融合。白色调搭配质朴木材，复古元素与现代便利共存的舒适家园。',
    characteristics: ['白色主调', '质朴木材', '复古装饰', '开放厨房', '舒适温馨'],
    colors: ['#F5F5DC', '#8B7355', '#556B2F', '#D2B48C', '#FFFAF0'],
    materials: ['仿古木', '铸铁', '陶瓷', '亚麻', '石材'],
    bestFor: ['郊区住宅', '家庭生活', '田园向往'],
    image: '/styles/farmhouse-detail.jpg',
  },
]

export default function ExplorePage() {
  const [selectedStyle, setSelectedStyle] = useState(designStyles[0])

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
              探索设计风格
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-warmgray-600 max-w-2xl mx-auto"
            >
              了解每种风格的特点和美学，找到最适合您的设计方向
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Style List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-warmgray-500 uppercase tracking-wider mb-4">
                设计风格
              </h3>
              {designStyles.map((style, index) => (
                <motion.button
                  key={style.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedStyle(style)}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-200
                    ${selectedStyle.id === style.id
                      ? 'bg-white shadow-lg ring-2 ring-terracotta-500'
                      : 'bg-white/50 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Color preview */}
                    <div className="flex -space-x-1">
                      {style.colors.slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-warmgray-900">{style.name}</h4>
                      <p className="text-sm text-warmgray-500">{style.nameEn}</p>
                    </div>
                    {selectedStyle.id === style.id && (
                      <Check className="w-5 h-5 text-terracotta-500" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Style Detail */}
            <div className="lg:col-span-2">
              <motion.div
                key={selectedStyle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Hero image placeholder */}
                <div 
                  className="h-64 md:h-80 relative"
                  style={{
                    background: `linear-gradient(135deg, ${selectedStyle.colors[0]} 0%, ${selectedStyle.colors[1]} 30%, ${selectedStyle.colors[2]} 60%, ${selectedStyle.colors[3]} 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-display font-bold text-white drop-shadow-lg mb-2">
                        {selectedStyle.name}
                      </h2>
                      <p className="text-white/80 text-lg">{selectedStyle.nameEn}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Description */}
                  <p className="text-lg text-warmgray-700 leading-relaxed mb-8">
                    {selectedStyle.description}
                  </p>

                  {/* Color Palette */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-warmgray-900 mb-4">色彩搭配</h3>
                    <div className="flex gap-3">
                      {selectedStyle.colors.map((color, i) => (
                        <div key={i} className="text-center">
                          <div
                            className="w-14 h-14 rounded-xl shadow-md border border-warmgray-100 mb-2"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs text-warmgray-500 font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-warmgray-900 mb-4">风格特点</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.characteristics.map((char, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-terracotta-50 text-terracotta-700 rounded-full text-sm font-medium"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-warmgray-900 mb-4">常用材质</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.materials.map((material, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-forest-50 text-forest-700 rounded-full text-sm font-medium"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-warmgray-900 mb-4">适合场景</h3>
                    <ul className="space-y-2">
                      {selectedStyle.bestFor.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-warmgray-700">
                          <Sparkles className="w-5 h-5 text-ocean-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/design?style=${selectedStyle.id}`}
                    className="btn-primary w-full justify-center text-lg"
                  >
                    使用{selectedStyle.name}风格开始设计
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

