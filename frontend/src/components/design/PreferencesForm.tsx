'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Sofa, 
  Target, 
  MessageSquare,
  Check,
  Plus
} from 'lucide-react'
import { useDesignStore } from '@/store/designStore'

const colorOptions = [
  { id: 'neutral', name: '中性色', colors: ['#FFFFFF', '#E5E5E5', '#8B8B8B', '#2D2D2D'] },
  { id: 'warm', name: '暖色调', colors: ['#FFF5E6', '#FFB347', '#D2691E', '#8B4513'] },
  { id: 'cool', name: '冷色调', colors: ['#E6F3FF', '#87CEEB', '#4682B4', '#1E3A5F'] },
  { id: 'earth', name: '大地色', colors: ['#F5F5DC', '#C4A77D', '#8B7355', '#556B2F'] },
  { id: 'pastel', name: '糖果色', colors: ['#FFE4E1', '#E0BBE4', '#957DAD', '#D4A5A5'] },
  { id: 'bold', name: '鲜艳色', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96C93D'] },
]

const requirementOptions = [
  { id: 'workspace', label: '工作区域', icon: '💻' },
  { id: 'gaming', label: '游戏空间', icon: '🎮' },
  { id: 'reading', label: '阅读角落', icon: '📚' },
  { id: 'pet', label: '宠物友好', icon: '🐱' },
  { id: 'kids', label: '儿童安全', icon: '👶' },
  { id: 'storage', label: '更多收纳', icon: '📦' },
  { id: 'plants', label: '绿植空间', icon: '🌿' },
  { id: 'entertainment', label: '娱乐中心', icon: '📺' },
]

export function PreferencesForm() {
  const { preferences, updatePreferences, analysis } = useDesignStore()
  const [newFurniture, setNewFurniture] = useState('')

  const toggleColorPreference = (colorId: string) => {
    const current = preferences.colorPreference || []
    if (current.includes(colorId)) {
      updatePreferences('colorPreference', current.filter(c => c !== colorId))
    } else {
      updatePreferences('colorPreference', [...current, colorId])
    }
  }

  const toggleRequirement = (reqId: string) => {
    const current = preferences.requirements || []
    if (current.includes(reqId)) {
      updatePreferences('requirements', current.filter(r => r !== reqId))
    } else {
      updatePreferences('requirements', [...current, reqId])
    }
  }

  const toggleKeepFurniture = (furniture: string) => {
    const current = preferences.keepFurniture || []
    if (current.includes(furniture)) {
      updatePreferences('keepFurniture', current.filter(f => f !== furniture))
    } else {
      updatePreferences('keepFurniture', [...current, furniture])
    }
  }

  const addCustomFurniture = () => {
    if (newFurniture.trim()) {
      const current = preferences.keepFurniture || []
      updatePreferences('keepFurniture', [...current, newFurniture.trim()])
      setNewFurniture('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Color Preferences */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warmgray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-terracotta-100 flex items-center justify-center">
            <Palette className="w-5 h-5 text-terracotta-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">色彩偏好</h3>
            <p className="text-sm text-warmgray-500">选择您喜欢的色调</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {colorOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleColorPreference(option.id)}
              className={`
                relative p-4 rounded-xl text-left transition-all duration-200
                ${preferences.colorPreference?.includes(option.id)
                  ? 'bg-terracotta-50 ring-2 ring-terracotta-500'
                  : 'bg-warmgray-50 hover:bg-warmgray-100'
                }
              `}
            >
              {preferences.colorPreference?.includes(option.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-terracotta-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex gap-1 mb-2">
                {option.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-warmgray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-warmgray-700">
                {option.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Keep Furniture */}
      {analysis?.existingFurniture && analysis.existingFurniture.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-warmgray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-ocean-100 flex items-center justify-center">
              <Sofa className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">保留家具</h3>
              <p className="text-sm text-warmgray-500">选择需要保留的现有家具</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {analysis.existingFurniture.map((furniture) => (
              <motion.button
                key={furniture}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleKeepFurniture(furniture)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${preferences.keepFurniture?.includes(furniture)
                    ? 'bg-ocean-500 text-white'
                    : 'bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200'
                  }
                `}
              >
                {furniture}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newFurniture}
              onChange={(e) => setNewFurniture(e.target.value)}
              placeholder="添加其他家具..."
              className="input-primary flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addCustomFurniture()}
            />
            <button
              onClick={addCustomFurniture}
              className="btn-secondary py-2 px-4"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Special Requirements */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warmgray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
            <Target className="w-5 h-5 text-forest-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">特殊需求</h3>
            <p className="text-sm text-warmgray-500">选择空间功能需求</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {requirementOptions.map((req) => (
            <motion.button
              key={req.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleRequirement(req.id)}
              className={`
                p-4 rounded-xl text-center transition-all duration-200
                ${preferences.requirements?.includes(req.id)
                  ? 'bg-forest-50 ring-2 ring-forest-500'
                  : 'bg-warmgray-50 hover:bg-warmgray-100'
                }
              `}
            >
              <span className="text-2xl mb-2 block">{req.icon}</span>
              <span className="text-sm font-medium text-warmgray-700">
                {req.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Furniture Suggestions - AI WILL follow these */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Sofa className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">🎯 家具意见（AI必采纳）</h3>
            <p className="text-sm text-blue-600 font-medium">您的具体要求会直接影响渲染效果</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong>在这里描述您想要的具体家具和布置，AI会在渲染时采纳您的意见。例如：
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• "我想要一个L型大沙发"</li>
            <li>• "靠窗放一张书桌和椅子"</li>
            <li>• "电视墙要简洁大气"</li>
            <li>• "需要很多绿植装饰"</li>
          </ul>
        </div>

        <textarea
          value={preferences.specialNeeds || ''}
          onChange={(e) => updatePreferences('specialNeeds', e.target.value)}
          placeholder="在这里描述您想要的具体家具、布置方式、装饰品等，AI会根据您的描述进行渲染..."
          rows={5}
          className="input-primary resize-none border-blue-200 focus:ring-blue-500"
        />
      </div>

      {/* Additional Notes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">其他补充说明</h3>
            <p className="text-sm text-slate-500">风格偏好、颜色禁忌等</p>
          </div>
        </div>

        <textarea
          value={preferences.additionalNotes || ''}
          onChange={(e) => updatePreferences('additionalNotes', e.target.value)}
          placeholder="例如：不喜欢太深的颜色，希望整体明亮通透..."
          rows={3}
          className="input-primary resize-none"
        />
      </div>
    </div>
  )
}

