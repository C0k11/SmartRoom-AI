'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useDesignStore, DesignStyle } from '@/store/designStore'
import { useLanguage } from '@/lib/i18n'

const designStyles: (DesignStyle & { descEn: string })[] = [
  {
    id: 'modern',
    name: '现代简约',
    nameEn: 'Modern Minimalist',
    description: '简洁线条，功能性设计，中性色调',
    descEn: 'Clean lines, functional design, neutral tones',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=500&fit=crop',
    colors: ['#FFFFFF', '#1A1A1A', '#C4C4C4', '#8B7355'],
  },
  {
    id: 'nordic',
    name: '北欧风格',
    nameEn: 'Scandinavian',
    description: '自然材质，明亮空间，温暖木质',
    descEn: 'Natural materials, bright spaces, warm wood',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop',
    colors: ['#FEFEFE', '#E8DED1', '#6B8E6B', '#D4A574'],
  },
  {
    id: 'japanese',
    name: '日式禅风',
    nameEn: 'Japanese Zen',
    description: '极简美学，自然元素，宁静氛围',
    descEn: 'Minimalist aesthetics, natural elements, serene atmosphere',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=500&fit=crop',
    colors: ['#F5F1EB', '#3D3D3D', '#8B9A6B', '#C9B896'],
  },
  {
    id: 'industrial',
    name: '工业风格',
    nameEn: 'Industrial',
    description: '裸露材质，金属元素，粗犷美感',
    descEn: 'Exposed materials, metal elements, rugged beauty',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop',
    colors: ['#4A4A4A', '#8B4513', '#2F2F2F', '#C9C9C9'],
  },
  {
    id: 'bohemian',
    name: '波西米亚',
    nameEn: 'Bohemian',
    description: '色彩丰富，自由混搭，异域风情',
    descEn: 'Rich colors, eclectic mix, exotic vibes',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=500&fit=crop',
    colors: ['#D2691E', '#8B4513', '#228B22', '#4169E1'],
  },
  {
    id: 'midcentury',
    name: '中古世纪',
    nameEn: 'Mid-Century Modern',
    description: '复古造型，有机曲线，经典配色',
    descEn: 'Retro shapes, organic curves, classic colors',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=500&fit=crop',
    colors: ['#DAA520', '#2F4F4F', '#CD853F', '#F4A460'],
  },
  {
    id: 'coastal',
    name: '海岸风格',
    nameEn: 'Coastal',
    description: '清新蓝白，自然纹理，度假氛围',
    descEn: 'Fresh blue-white, natural textures, vacation vibes',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop',
    colors: ['#FFFFFF', '#87CEEB', '#F5DEB3', '#4682B4'],
  },
  {
    id: 'farmhouse',
    name: '田园农舍',
    nameEn: 'Farmhouse',
    description: '乡村温馨，复古元素，舒适自然',
    descEn: 'Rustic warmth, vintage elements, cozy natural',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=500&fit=crop',
    colors: ['#F5F5DC', '#8B7355', '#556B2F', '#D2B48C'],
  },
]

export function StyleSelector() {
  const { selectedStyle, setSelectedStyle } = useDesignStore()
  const { language } = useLanguage()

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
          {/* Real preview image */}
          <div className="aspect-[4/5] relative overflow-hidden">
            <img 
              src={style.image}
              alt={style.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Fallback gradient if image fails */}
            <div 
              className="absolute inset-0 -z-10"
              style={{
                background: `linear-gradient(135deg, ${style.colors[0]} 0%, ${style.colors[1]} 50%, ${style.colors[2]} 100%)`,
              }}
            />
            
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
              <h3 className="text-lg font-bold mb-0.5">{language === 'zh' ? style.name : style.nameEn}</h3>
              <p className="text-sm text-white/70 mb-3">{language === 'zh' ? style.nameEn : style.name}</p>
              <p className="text-sm text-white/90 line-clamp-2">{language === 'zh' ? style.description : style.descEn}</p>
              
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

