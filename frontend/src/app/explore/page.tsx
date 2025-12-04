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
import { useLanguage } from '@/lib/i18n'

const designStyles = [
  {
    id: 'modern',
    name: '现代简约',
    nameEn: 'Modern Minimalist',
    description: '简洁线条、功能至上、中性色调。现代简约风格追求"少即是多"的设计理念，通过精简的元素和高品质的材料创造优雅空间。',
    descriptionEn: 'Clean lines, function-first, neutral tones. Modern minimalist style pursues the "less is more" philosophy, creating elegant spaces with refined elements and high-quality materials.',
    characteristics: ['简洁线条', '中性色调', '功能性设计', '高品质材料', '开放空间'],
    characteristicsEn: ['Clean Lines', 'Neutral Tones', 'Functional Design', 'Quality Materials', 'Open Space'],
    colors: ['#FFFFFF', '#1A1A1A', '#C4C4C4', '#8B7355', '#F5F5F5'],
    materials: ['大理石', '金属', '玻璃', '混凝土'],
    materialsEn: ['Marble', 'Metal', 'Glass', 'Concrete'],
    bestFor: ['都市公寓', '办公空间', '追求效率的生活方式'],
    bestForEn: ['Urban Apartments', 'Office Spaces', 'Efficiency-focused Living'],
    image: '/styles/modern-detail.jpg',
  },
  {
    id: 'nordic',
    name: '北欧风格',
    nameEn: 'Scandinavian',
    description: '源自斯堪的纳维亚的设计哲学，强调自然光、温暖木质和舒适的Hygge生活美学。打造明亮、温馨、与自然和谐共处的居住空间。',
    descriptionEn: 'Scandinavian design philosophy emphasizing natural light, warm wood, and cozy Hygge aesthetics. Creating bright, warm spaces in harmony with nature.',
    characteristics: ['自然采光', '原木质感', '温暖织物', '绿植点缀', '功能美学'],
    characteristicsEn: ['Natural Light', 'Wood Texture', 'Warm Textiles', 'Plants', 'Functional Beauty'],
    colors: ['#FEFEFE', '#E8DED1', '#6B8E6B', '#D4A574', '#F0EDE8'],
    materials: ['橡木', '松木', '亚麻', '羊毛', '陶瓷'],
    materialsEn: ['Oak', 'Pine', 'Linen', 'Wool', 'Ceramics'],
    bestFor: ['家庭住宅', '需要温馨氛围', '喜爱自然元素'],
    bestForEn: ['Family Homes', 'Cozy Atmosphere', 'Nature Lovers'],
    image: '/styles/nordic-detail.jpg',
  },
  {
    id: 'japanese',
    name: '日式禅风',
    nameEn: 'Japanese Zen',
    description: '融合日本传统美学与禅宗哲学，追求"侘寂"之美。通过极简主义、自然材质和留白艺术，创造宁静致远的冥想空间。',
    descriptionEn: 'Blending Japanese aesthetics with Zen philosophy, pursuing Wabi-sabi beauty. Creating serene meditation spaces through minimalism and natural materials.',
    characteristics: ['极简主义', '自然素材', '留白艺术', '低矮家具', '和纸障子'],
    characteristicsEn: ['Minimalism', 'Natural Materials', 'White Space', 'Low Furniture', 'Shoji Screens'],
    colors: ['#F5F1EB', '#3D3D3D', '#8B9A6B', '#C9B896', '#E8E4DC'],
    materials: ['竹子', '和纸', '榻榻米', '原木', '石材'],
    materialsEn: ['Bamboo', 'Washi Paper', 'Tatami', 'Raw Wood', 'Stone'],
    bestFor: ['追求内心平静', '冥想空间', '茶室书房'],
    bestForEn: ['Inner Peace', 'Meditation Spaces', 'Tea Rooms'],
    image: '/styles/japanese-detail.jpg',
  },
  {
    id: 'industrial',
    name: '工业风格',
    nameEn: 'Industrial',
    description: '灵感来自纽约LOFT和旧工厂改造，展现裸露材质的粗犷美感。金属管道、砖墙、混凝土共同构建个性鲜明的都市空间。',
    descriptionEn: 'Inspired by NYC lofts and factory conversions, showcasing raw material beauty. Metal pipes, brick walls, and concrete create distinctive urban spaces.',
    characteristics: ['裸露材质', '金属元素', '高挑空间', '复古灯具', '开放管线'],
    characteristicsEn: ['Exposed Materials', 'Metal Elements', 'High Ceilings', 'Vintage Lighting', 'Open Pipes'],
    colors: ['#4A4A4A', '#8B4513', '#2F2F2F', '#C9C9C9', '#6B5B4F'],
    materials: ['铁艺', '红砖', '水泥', '皮革', '回收木'],
    materialsEn: ['Iron', 'Red Brick', 'Cement', 'Leather', 'Reclaimed Wood'],
    bestFor: ['LOFT公寓', '工作室', '创意空间'],
    bestForEn: ['Loft Apartments', 'Studios', 'Creative Spaces'],
    image: '/styles/industrial-detail.jpg',
  },
  {
    id: 'bohemian',
    name: '波西米亚',
    nameEn: 'Bohemian',
    description: '自由不羁的艺术灵魂，融合世界各地的文化元素。色彩丰富的纺织品、手工艺品和绿植共同创造充满生命力的空间。',
    descriptionEn: 'Free-spirited artistic soul, blending cultural elements from around the world. Rich textiles, handicrafts, and plants create vibrant living spaces.',
    characteristics: ['丰富色彩', '混搭文化', '手工艺品', '层叠织物', '绿植丛林'],
    characteristicsEn: ['Rich Colors', 'Cultural Mix', 'Handicrafts', 'Layered Textiles', 'Plant Jungle'],
    colors: ['#D2691E', '#8B4513', '#228B22', '#4169E1', '#DAA520'],
    materials: ['棉麻', '藤编', '流苏', '地毯', '陶土'],
    materialsEn: ['Cotton Linen', 'Rattan', 'Tassels', 'Rugs', 'Clay'],
    bestFor: ['艺术家住所', '喜爱旅行者', '个性表达'],
    bestForEn: ['Artist Homes', 'Travel Lovers', 'Self Expression'],
    image: '/styles/bohemian-detail.jpg',
  },
  {
    id: 'midcentury',
    name: '中古世纪',
    nameEn: 'Mid-Century Modern',
    description: '致敬20世纪中期的黄金设计时代，有机曲线与几何形态的完美结合。经典家具设计与复古配色诠释永不过时的优雅。',
    descriptionEn: 'Honoring the golden design era of mid-20th century, perfect blend of organic curves and geometric forms. Classic furniture and retro colors define timeless elegance.',
    characteristics: ['有机曲线', '锥形腿', '几何图案', '复古配色', '功能主义'],
    characteristicsEn: ['Organic Curves', 'Tapered Legs', 'Geometric Patterns', 'Retro Colors', 'Functionalism'],
    colors: ['#DAA520', '#2F4F4F', '#CD853F', '#F4A460', '#8B4513'],
    materials: ['胡桃木', '柚木', '黄铜', '天鹅绒', '皮革'],
    materialsEn: ['Walnut', 'Teak', 'Brass', 'Velvet', 'Leather'],
    bestFor: ['设计爱好者', '复古品味', '经典永恒'],
    bestForEn: ['Design Lovers', 'Vintage Taste', 'Timeless Classic'],
    image: '/styles/midcentury-detail.jpg',
  },
  {
    id: 'coastal',
    name: '海岸风格',
    nameEn: 'Coastal',
    description: '将海洋的清新与宁静带入室内，蓝白配色搭配自然纹理，营造永恒度假的轻松氛围。仿佛时刻聆听海浪声。',
    descriptionEn: 'Bringing ocean freshness indoors, blue-white palette with natural textures creates eternal vacation vibes. Like hearing waves at all times.',
    characteristics: ['蓝白配色', '自然纹理', '贝壳元素', '通透明亮', '度假氛围'],
    characteristicsEn: ['Blue-White Palette', 'Natural Textures', 'Shell Elements', 'Bright & Airy', 'Vacation Vibes'],
    colors: ['#FFFFFF', '#87CEEB', '#F5DEB3', '#4682B4', '#E0E8E4'],
    materials: ['亚麻', '棉布', '藤编', '贝壳', '漂流木'],
    materialsEn: ['Linen', 'Cotton', 'Rattan', 'Shells', 'Driftwood'],
    bestFor: ['海边住宅', '度假屋', '追求放松'],
    bestForEn: ['Beach Houses', 'Vacation Homes', 'Relaxation Seekers'],
    image: '/styles/coastal-detail.jpg',
  },
  {
    id: 'farmhouse',
    name: '现代农舍',
    nameEn: 'Modern Farmhouse',
    description: '将乡村的温暖与现代的简洁完美融合。白色调搭配质朴木材，复古元素与现代便利共存的舒适家园。',
    descriptionEn: 'Perfect blend of rural warmth and modern simplicity. White tones with rustic wood, where vintage elements coexist with modern convenience.',
    characteristics: ['白色主调', '质朴木材', '复古装饰', '开放厨房', '舒适温馨'],
    characteristicsEn: ['White Tones', 'Rustic Wood', 'Vintage Decor', 'Open Kitchen', 'Cozy Comfort'],
    colors: ['#F5F5DC', '#8B7355', '#556B2F', '#D2B48C', '#FFFAF0'],
    materials: ['仿古木', '铸铁', '陶瓷', '亚麻', '石材'],
    materialsEn: ['Distressed Wood', 'Cast Iron', 'Ceramics', 'Linen', 'Stone'],
    bestFor: ['郊区住宅', '家庭生活', '田园向往'],
    bestForEn: ['Suburban Homes', 'Family Living', 'Country Living'],
    image: '/styles/farmhouse-detail.jpg',
  },
]

export default function ExplorePage() {
  const [selectedStyle, setSelectedStyle] = useState(designStyles[0])
  const { language } = useLanguage()

  const texts = {
    zh: {
      title: '探索设计风格',
      subtitle: '了解每种风格的特点和美学，找到最适合您的设计方向',
      styleList: '设计风格',
      colorPalette: '色彩搭配',
      characteristics: '风格特点',
      materials: '常用材质',
      bestFor: '适合场景',
      useStyle: '使用{style}风格开始设计',
    },
    en: {
      title: 'Explore Design Styles',
      subtitle: 'Learn about each style and find the best design direction for you',
      styleList: 'Design Styles',
      colorPalette: 'Color Palette',
      characteristics: 'Characteristics',
      materials: 'Materials',
      bestFor: 'Best For',
      useStyle: 'Start Design with {style}',
    }
  }
  const txt = texts[language]

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
              {txt.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-warmgray-600 max-w-2xl mx-auto"
            >
              {txt.subtitle}
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Style List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-warmgray-500 uppercase tracking-wider mb-4">
                {txt.styleList}
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
                      <h4 className="font-semibold text-warmgray-900">{language === 'zh' ? style.name : style.nameEn}</h4>
                      <p className="text-sm text-warmgray-500">{language === 'zh' ? style.nameEn : style.name}</p>
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
                        {language === 'zh' ? selectedStyle.name : selectedStyle.nameEn}
                      </h2>
                      <p className="text-white/80 text-lg">{language === 'zh' ? selectedStyle.nameEn : selectedStyle.name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Description */}
                  <p className="text-lg text-warmgray-700 leading-relaxed mb-8">
                    {language === 'zh' ? selectedStyle.description : selectedStyle.descriptionEn}
                  </p>

                  {/* Color Palette */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-warmgray-900 mb-4">{txt.colorPalette}</h3>
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
                    <h3 className="font-semibold text-warmgray-900 mb-4">{txt.characteristics}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(language === 'zh' ? selectedStyle.characteristics : selectedStyle.characteristicsEn).map((char, i) => (
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
                    <h3 className="font-semibold text-warmgray-900 mb-4">{txt.materials}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(language === 'zh' ? selectedStyle.materials : selectedStyle.materialsEn).map((material, i) => (
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
                    <h3 className="font-semibold text-warmgray-900 mb-4">{txt.bestFor}</h3>
                    <ul className="space-y-2">
                      {(language === 'zh' ? selectedStyle.bestFor : selectedStyle.bestForEn).map((item, i) => (
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
                    {txt.useStyle.replace('{style}', language === 'zh' ? selectedStyle.name : selectedStyle.nameEn)}
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

