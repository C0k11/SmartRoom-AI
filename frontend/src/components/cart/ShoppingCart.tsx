'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart as CartIcon, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Download,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create a simple text file as placeholder
    const content = `
RoomAI 购物清单
================

${items.map((item, i) => `
${i + 1}. ${item.name}
   品牌: ${item.brand || '未知'}
   尺寸: ${item.dimensions || '未知'}
   单价: ${formatCurrency(item.price)}
   数量: ${item.quantity}
   小计: ${formatCurrency(item.price * item.quantity)}
`).join('\n')}

================
总计: ${formatCurrency(totalPrice())}

生成时间: ${new Date().toLocaleString('zh-CN')}
    `.trim()
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `购物清单_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    setIsExporting(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Cart panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-warmgray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CartIcon className="w-6 h-6 text-terracotta-500" />
                <h2 className="text-xl font-bold">购物清单</h2>
                <span className="px-2 py-0.5 bg-terracotta-100 text-terracotta-600 text-sm font-medium rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-warmgray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-warmgray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-warmgray-100 rounded-full flex items-center justify-center mb-4">
                    <CartIcon className="w-8 h-8 text-warmgray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-warmgray-700 mb-2">
                    购物清单是空的
                  </h3>
                  <p className="text-warmgray-500">
                    从设计方案中添加家具到清单
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-warmgray-50 rounded-xl"
                    >
                      {/* Image placeholder */}
                      <div className="w-20 h-20 bg-warmgray-200 rounded-lg flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-warmgray-900 truncate">
                          {item.name}
                        </h4>
                        {item.brand && (
                          <p className="text-sm text-warmgray-500">{item.brand}</p>
                        )}
                        <p className="text-terracotta-600 font-medium mt-1">
                          {formatCurrency(item.price)}
                        </p>
                        
                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-warmgray-200 hover:bg-warmgray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-warmgray-200 hover:bg-warmgray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-warmgray-200 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-warmgray-500" />
                              </a>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-warmgray-100 bg-warmgray-50">
                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-warmgray-600">预估总价</span>
                  <span className="text-2xl font-bold text-warmgray-900">
                    {formatCurrency(totalPrice())}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="btn-primary w-full justify-center"
                  >
                    {isExporting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        下载购物清单
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={clearCart}
                    className="btn-ghost w-full justify-center text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    清空清单
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Cart button component for header
export function CartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-warmgray-100 rounded-xl transition-colors"
      >
        <CartIcon className="w-6 h-6 text-warmgray-600" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>
      
      <ShoppingCart isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

