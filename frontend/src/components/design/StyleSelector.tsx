'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useDesignStore, DesignStyle } from '@/store/designStore'

const designStyles: DesignStyle[] = [
  {
    id: 'modern',
    name: '现代简约',
    nameEn: 'Modern Minimalist',
    description: '简洁线条，功能性设计，中性色调',
    image: '/styles/modern.jpg',
    colors: ['#FFFFFF', '#1A1A1A', '#C4C4C4', '#8B7355'],
  },
  {
    id: 'nordic',
    name: '北欧风格',
    nameEn: 'Scandinavian',
    description: '自然材质，明亮空间，温暖木质',
    image: '/styles/nordic.jpg',
    colors: ['#FEFEFE', '#E8DED1', '#6B8E6B', '#D4A574'],
  },
  {
    id: 'japanese',
    name: '日式禅风',
    nameEn: 'Japanese Zen',
    description: '极简美学，自然元素，宁静氛围',
    image: '/styles/japanese.jpg',
    colors: ['#F5F1EB', '#3D3D3D', '#8B9A6B', '#C9B896'],
  },
  {
    id: 'industrial',
    name: '工业风格',
    nameEn: 'Industrial',
    description: '裸露材质，金属元素，粗犷美感',
    image: '/styles/industrial.jpg',
    colors: ['#4A4A4A', '#8B4513', '#2F2F2F', '#C9C9C9'],
  },
  {
    id: 'bohemian',
    name: '波西米亚',
    nameEn: 'Bohemian',
    description: '色彩丰富，自由混搭，异域风情',
    image: '/styles/bohemian.jpg',
    colors: ['#D2691E', '#8B4513', '#228B22', '#4169E1'],
  },
  {
    id: 'midcentury',
    name: '中古世纪',
    nameEn: 'Mid-Century Modern',
    description: '复古造型，有机曲线，经典配色',
    image: '/styles/midcentury.jpg',
    colors: ['#DAA520', '#2F4F4F', '#CD853F', '#F4A460'],
  },
  {
    id: 'coastal',
    name: '海岸风格',
    nameEn: 'Coastal',
    description: '清新蓝白，自然纹理，度假氛围',
    image: '/styles/coastal.jpg',
    colors: ['#FFFFFF', '#87CEEB', '#F5DEB3', '#4682B4'],
  },
  {
    id: 'farmhouse',
    name: '田园农舍',
    nameEn: 'Farmhouse',
    description: '乡村温馨，复古元素，舒适自然',
    image: '/styles/farmhouse.jpg',
    colors: ['#F5F5DC', '#8B7355', '#556B2F', '#D2B48C'],
  },
]

export function StyleSelector() {
  const { selectedStyle, setSelectedStyle } = useDesignStore()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {designStyles.map((style, index) => (
        <motion.button
          key={style.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setSelectedStyle(style)}
          className={`
            relative group text-left rounded-2xl overflow-hidden
            transition-all duration-300
            ${selectedStyle?.id === style.id
              ? 'ring-2 ring-terracotta-500 ring-offset-2'
              : 'hover:shadow-elevated'
            }
          `}
        >
          {/* Image placeholder with gradient */}
          <div className="aspect-[4/5] relative overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${style.colors[0]} 0%, ${style.colors[1]} 50%, ${style.colors[2]} 100%)`,
              }}
            />
            
            {/* Decorative elements to simulate room */}
            <div className="absolute inset-0 flex items-end justify-center p-4">
              <div className="w-full h-2/3 rounded-t-lg opacity-20" style={{ backgroundColor: style.colors[3] }} />
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Selected indicator */}
            {selectedStyle?.id === style.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            )}
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg font-bold mb-0.5">{style.name}</h3>
              <p className="text-sm text-white/70 mb-3">{style.nameEn}</p>
              <p className="text-sm text-white/90 line-clamp-2">{style.description}</p>
              
              {/* Color swatches */}
              <div className="flex gap-1.5 mt-3">
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

