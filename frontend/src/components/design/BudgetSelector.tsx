'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp } from 'lucide-react'
import { useDesignStore } from '@/store/designStore'

const presetBudgets = [
  { value: 2000, label: '经济型', description: '基础改造' },
  { value: 5000, label: '舒适型', description: '品质提升' },
  { value: 10000, label: '高端型', description: '全面改造' },
  { value: 20000, label: '奢华型', description: '顶级配置' },
]

export function BudgetSelector() {
  const { preferences, updatePreferences } = useDesignStore()
  const [customBudget, setCustomBudget] = useState<string>('')

  const handlePresetSelect = (value: number) => {
    updatePreferences('budget', value)
    setCustomBudget('')
  }

  const handleCustomBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setCustomBudget(value)
    if (value) {
      updatePreferences('budget', parseInt(value))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warmgray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-forest-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg">预算设置</h3>
          <p className="text-sm text-warmgray-500">选择或输入您的装修预算</p>
        </div>
      </div>

      {/* Preset budgets */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {presetBudgets.map((preset) => (
          <motion.button
            key={preset.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePresetSelect(preset.value)}
            className={`
              p-4 rounded-xl text-left transition-all duration-200
              ${preferences.budget === preset.value && !customBudget
                ? 'bg-terracotta-50 border-2 border-terracotta-500'
                : 'bg-warmgray-50 border-2 border-transparent hover:border-warmgray-200'
              }
            `}
          >
            <div className="font-bold text-lg text-warmgray-900">
              {formatCurrency(preset.value)}
            </div>
            <div className="text-sm font-medium text-terracotta-600">
              {preset.label}
            </div>
            <div className="text-xs text-warmgray-500 mt-1">
              {preset.description}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Custom budget input */}
      <div className="relative">
        <label className="block text-sm font-medium text-warmgray-700 mb-2">
          或输入自定义预算
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warmgray-400">
            ¥
          </span>
          <input
            type="text"
            value={customBudget}
            onChange={handleCustomBudgetChange}
            placeholder="输入金额"
            className="input-primary pl-8"
          />
        </div>
      </div>

      {/* Current selection */}
      {preferences.budget && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-forest-50 to-ocean-50 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-forest-600" />
            <span className="text-warmgray-700">已选预算</span>
          </div>
          <span className="font-bold text-lg text-forest-700">
            {formatCurrency(preferences.budget)}
          </span>
        </motion.div>
      )}
    </div>
  )
}

