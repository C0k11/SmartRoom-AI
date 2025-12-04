'use client'

import { motion } from 'framer-motion'
import { 
  Home, 
  Ruler, 
  Sofa, 
  Palette, 
  Sun, 
  AlertTriangle,
  Sparkles,
  Loader2
} from 'lucide-react'
import { RoomAnalysis } from '@/store/designStore'
import { useLanguage } from '@/lib/i18n'

interface AnalysisResultProps {
  analysis: RoomAnalysis | null
  isLoading: boolean
}

export function AnalysisResult({ analysis, isLoading }: AnalysisResultProps) {
  const { language } = useLanguage()

  const roomTypeLabels: Record<string, { zh: string; en: string }> = {
    living: { zh: '客厅', en: 'Living Room' },
    bedroom: { zh: '卧室', en: 'Bedroom' },
    kitchen: { zh: '厨房', en: 'Kitchen' },
    bathroom: { zh: '卫生间', en: 'Bathroom' },
    office: { zh: '书房/办公室', en: 'Office' },
    dining: { zh: '餐厅', en: 'Dining Room' },
    other: { zh: '其他', en: 'Other' },
  }

  const texts = {
    zh: {
      analyzing: '正在分析您的房间...',
      analyzingDesc: 'AI正在识别房间布局、家具和设计潜力',
      steps: ['识别房间类型', '分析现有家具', '评估空间布局', '生成改造建议'],
      waiting: '等待上传',
      waitingDesc: '上传照片后，这里将显示AI分析结果',
      complete: '分析完成',
      confidence: '置信度',
      roomType: '房间类型',
      dimensions: '估计尺寸',
      furniture: '现有家具',
      style: '当前风格',
      lighting: '光线情况',
      problems: '发现问题',
      potential: '空间潜力',
    },
    en: {
      analyzing: 'Analyzing your room...',
      analyzingDesc: 'AI is identifying layout, furniture and design potential',
      steps: ['Identifying room type', 'Analyzing furniture', 'Evaluating layout', 'Generating suggestions'],
      waiting: 'Waiting for upload',
      waitingDesc: 'Upload a photo to see AI analysis results',
      complete: 'Analysis Complete',
      confidence: 'Confidence',
      roomType: 'Room Type',
      dimensions: 'Estimated Size',
      furniture: 'Existing Furniture',
      style: 'Current Style',
      lighting: 'Lighting',
      problems: 'Issues Found',
      potential: 'Space Potential',
    }
  }
  const txt = texts[language]

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-warmgray-100 h-full flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-terracotta-500 to-forest-500 flex items-center justify-center mb-6"
        >
          <Loader2 className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{txt.analyzing}</h3>
        <p className="text-warmgray-500">
          {txt.analyzingDesc}
        </p>
        
        <div className="mt-8 space-y-3 w-full max-w-sm">
          {txt.steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.5 }}
                className="w-2 h-2 rounded-full bg-terracotta-500"
              />
              <span className="text-warmgray-600">{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-warmgray-100/50 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-warmgray-200">
        <div className="w-16 h-16 rounded-full bg-warmgray-200 flex items-center justify-center mb-6">
          <Home className="w-8 h-8 text-warmgray-400" />
        </div>
        <h3 className="text-xl font-bold text-warmgray-500 mb-2">{txt.waiting}</h3>
        <p className="text-warmgray-400">
          {txt.waitingDesc}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-warmgray-100 overflow-hidden h-full"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-terracotta-500 to-forest-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{txt.complete}</h3>
            <p className="text-white/80 text-sm mt-1">
              {txt.confidence}: {Math.round(analysis.confidence * 100)}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Room Type */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-terracotta-100 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-terracotta-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warmgray-900">{txt.roomType}</h4>
            <p className="text-warmgray-600">
              {roomTypeLabels[analysis.roomType]?.[language] || analysis.roomType}
            </p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-ocean-100 flex items-center justify-center flex-shrink-0">
            <Ruler className="w-5 h-5 text-ocean-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warmgray-900">{txt.dimensions}</h4>
            <p className="text-warmgray-600">
              {analysis.dimensions.width}m × {analysis.dimensions.length}m × {analysis.dimensions.height}m
            </p>
          </div>
        </div>

        {/* Existing Furniture */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
            <Sofa className="w-5 h-5 text-forest-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warmgray-900">{txt.furniture}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {analysis.existingFurniture.map((furniture, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-warmgray-100 text-warmgray-700 text-sm rounded-lg"
                >
                  {furniture}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Style */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-warmgray-100 flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-warmgray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warmgray-900">{txt.style}</h4>
            <p className="text-warmgray-600">{analysis.currentStyle}</p>
          </div>
        </div>

        {/* Lighting */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Sun className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warmgray-900">{txt.lighting}</h4>
            <p className="text-warmgray-600">{analysis.lighting}</p>
          </div>
        </div>

        {/* Problems */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warmgray-900">{txt.problems}</h4>
            <ul className="text-warmgray-600 space-y-1 mt-1">
              {analysis.problems.map((problem, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Potential */}
        <div className="mt-6 p-4 bg-gradient-to-r from-forest-50 to-ocean-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-forest-600" />
            <h4 className="font-semibold text-forest-800">{txt.potential}</h4>
          </div>
          <p className="text-forest-700 text-sm leading-relaxed">
            {analysis.potential}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

