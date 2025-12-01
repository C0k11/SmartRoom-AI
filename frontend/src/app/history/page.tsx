'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Trash2, 
  Eye, 
  Download, 
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth'
import { formatCAD } from '@/lib/i18n'
import toast from 'react-hot-toast'

interface HistoryItem {
  id: string
  name: string
  description: string
  image: string
  style: string
  totalCost: number
  savedAt: string
  originalImage?: string
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('designHistory')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const deleteItem = (id: string) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem('designHistory', JSON.stringify(updated))
    toast.success('已删除')
  }

  const clearAll = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([])
      localStorage.removeItem('designHistory')
      toast.success('历史记录已清空')
    }
  }

  const downloadImage = async (item: HistoryItem) => {
    try {
      const response = await fetch(item.image)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${item.name}-${new Date(item.savedAt).toLocaleDateString()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('下载成功')
    } catch (err) {
      toast.error('下载失败')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">请先登录</h1>
            <Link href="/login" className="btn-primary">
              去登录
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/design" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回设计
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                设计历史
              </h1>
              <p className="text-slate-600 mt-2">
                查看您保存的所有设计方案
              </p>
            </div>
            
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="btn-ghost text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                清空历史
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-600 mb-2">暂无历史记录</h2>
              <p className="text-slate-500 mb-6">您还没有保存任何设计方案</p>
              <Link href="/design" className="btn-primary">
                开始设计
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-video relative group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-3 bg-white rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => downloadImage(item)}
                        className="p-3 bg-white rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Download className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.savedAt).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                        <DollarSign className="w-4 h-4" />
                        {formatCAD(item.totalCost)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-full rounded-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-white">{selectedItem.name}</h3>
              <p className="text-white/70 mt-2">{selectedItem.description}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

