'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Eye, 
  ShoppingCart, 
  Download,
  Share2,
  Heart,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Copy,
  X,
  Save,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useDesignStore, DesignProposal } from '@/store/designStore'
import { designApi, analysisApi } from '@/lib/api'
import { useLanguage, formatCAD } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

// Fallback design data with i18n support
const fallbackDesignsData = {
  zh: [
    {
      id: 'fallback-1',
      name: '都市雅韵',
      description: '融合现代简约与北欧温暖，打造都市人的理想居所',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      style: '现代简约 + 北欧',
      confidence: 0.95,
      highlights: ['开放式布局', '自然光优化', '多功能储物'],
      totalCost: 8500,
      furniture: [
        { id: 'f1', name: '北欧布艺沙发', category: '沙发', price: 3200, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', link: 'https://www.ikea.cn', dimensions: '220x85x80cm', brand: 'IKEA' },
        { id: 'f2', name: '原木茶几', category: '茶几', price: 1200, image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200', link: 'https://www.taobao.com', dimensions: '120x60x45cm', brand: 'Yuanshi Wood' },
      ],
    },
    {
      id: 'fallback-2',
      name: '禅意栖居',
      description: '极简日式美学，营造宁静致远的生活空间',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
      style: '日式禅风',
      confidence: 0.92,
      highlights: ['极简设计', '自然材质', '禅意氛围'],
      totalCost: 7200,
      furniture: [
        { id: 'f5', name: '榻榻米沙发', category: '沙发', price: 2800, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', link: 'https://www.taobao.com', dimensions: '200x90x35cm', brand: 'Muzhi Studio' },
      ],
    },
  ],
  en: [
    {
      id: 'fallback-1',
      name: 'Urban Elegance',
      description: 'Blending modern minimalism with Nordic warmth, creating the ideal urban dwelling',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      style: 'Modern + Nordic',
      confidence: 0.95,
      highlights: ['Open Layout', 'Natural Light', 'Multi-functional Storage'],
      totalCost: 8500,
      furniture: [
        { id: 'f1', name: 'Nordic Fabric Sofa', category: 'Sofa', price: 3200, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', link: 'https://www.ikea.com', dimensions: '220x85x80cm', brand: 'IKEA' },
        { id: 'f2', name: 'Solid Wood Coffee Table', category: 'Table', price: 1200, image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200', link: 'https://www.amazon.com', dimensions: '120x60x45cm', brand: 'Yuanshi Wood' },
      ],
    },
    {
      id: 'fallback-2',
      name: 'Zen Retreat',
      description: 'Minimalist Japanese aesthetics, creating a serene and peaceful living space',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
      style: 'Japanese Zen',
      confidence: 0.92,
      highlights: ['Minimalist Design', 'Natural Materials', 'Zen Atmosphere'],
      totalCost: 7200,
      furniture: [
        { id: 'f5', name: 'Tatami Sofa', category: 'Sofa', price: 2800, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', link: 'https://www.amazon.com', dimensions: '200x90x35cm', brand: 'Muzhi Studio' },
      ],
    },
  ],
}

export function DesignResults() {
  const { 
    isGenerating, 
    setIsGenerating, 
    designs, 
    setDesigns,
    selectedDesign,
    setSelectedDesign,
    uploadedImage,
    analysis,
    selectedStyle,
    preferences
  } = useDesignStore()
  
  const { isAuthenticated } = useAuth()
  const { language, t } = useLanguage()

  const [activeTab, setActiveTab] = useState<'preview' | 'furniture'>('preview')
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const isGeneratingRef = useRef(false) // Prevent duplicate requests
  const currentJobIdRef = useRef<string | null>(null) // Track current job
  
  // New states for features
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // 调用真实API生成设计
  const generateDesigns = async () => {
    // Prevent duplicate requests
    if (isGeneratingRef.current) {
      console.log('Generation already in progress, skipping...')
      return
    }
    
    isGeneratingRef.current = true
    currentJobIdRef.current = null
    
    setIsGenerating(true)
    setIsLoading(true)
    setError(null)
    setProgress(0)
    setStatusMessage(language === 'zh' ? '开始生成设计方案...' : 'Starting design generation...')

    try {
      // Step 1: 如果有上传图片，先分析
      let analysisId: string | undefined = undefined

      if (uploadedImage) {
        setStatusMessage(language === 'zh' ? '正在分析房间照片...' : 'Analyzing room photo...')
        setProgress(10)
        
        // 将base64转为File
        const response = await fetch(uploadedImage)
        const blob = await response.blob()
        const file = new File([blob], 'room.jpg', { type: 'image/jpeg' })
        
        // 上传分析
        const uploadResult = await analysisApi.uploadImage(file)
        analysisId = uploadResult.id
        
        // 轮询分析状态
        let analysisComplete = false
        while (!analysisComplete) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          const status = await analysisApi.getStatus(analysisId!)
          setProgress(10 + Math.min(status.progress * 0.3, 30))
          setStatusMessage(language === 'zh' ? `分析中... ${status.progress}%` : `Analyzing... ${status.progress}%`)
          
          if (status.status === 'completed') {
            analysisComplete = true
          } else if (status.status === 'failed') {
            throw new Error(status.error || '房间分析失败')
          }
        }
      }

      // Step 2: 调用设计生成API
      setStatusMessage(language === 'zh' ? '正在生成设计方案...' : 'Generating design...')
      setProgress(40)
      
      const designResult = await designApi.generate(analysisId || 'demo', {
        style: selectedStyle || 'modern',
        budget: preferences?.budget || 10000,
        budget_range: preferences?.budgetRange || [5000, 20000],
        keep_furniture: preferences?.keepFurniture || [],
        requirements: preferences?.requirements || [],
        color_preference: preferences?.colorPreference || [],
        special_needs: preferences?.specialNeeds || '',
      }, language)

      const jobId = designResult.id
      currentJobIdRef.current = jobId // Track current job
      
      // Step 3: 轮询设计生成状态
      let designComplete = false
      while (!designComplete && currentJobIdRef.current === jobId) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        try {
          const status = await designApi.getStatus(jobId)
          const currentProgress = 40 + Math.min(status.progress * 0.6, 60)
          setProgress(currentProgress)
          
          if (status.progress < 30) {
            setStatusMessage(language === 'zh' ? '正在分析设计需求...' : 'Analyzing requirements...')
          } else if (status.progress < 60) {
            setStatusMessage(language === 'zh' ? '正在生成设计理念...' : 'Generating concepts...')
          } else if (status.progress < 90) {
            setStatusMessage(language === 'zh' ? '正在渲染效果图...' : 'Rendering images...')
          } else {
            setStatusMessage(language === 'zh' ? '正在匹配家具产品...' : 'Matching furniture...')
          }
          
          if (status.status === 'completed' && status.proposals) {
            designComplete = true
            
                            // 转换API返回的数据格式
                            const convertedDesigns: DesignProposal[] = status.proposals.map((p: any) => ({
                              id: p.id,
                              name: p.name,
                              description: p.description,
                              image: p.image_url,
                              style: p.style,
                              confidence: p.confidence,
                              highlights: p.highlights,
                              totalCost: p.total_cost,
                              furniture: p.furniture.map((f: any) => ({
                                id: f.id,
                                name: f.name,
                                name_en: f.name_en,
                                category: f.category,
                                price: f.price,
                                image: f.image,
                                link: f.link,
                                links: f.links,  // Multiple platform links
                                dimensions: f.dimensions,
                                brand: f.brand,
                              })),
                            }))
            
            setProgress(100)
            setDesigns(convertedDesigns)
            setSelectedDesign(convertedDesigns[0])
            toast.success(language === 'zh' ? '设计方案生成完成！' : 'Design generation complete!')
          } else if (status.status === 'failed') {
            throw new Error(status.error || '设计生成失败')
          }
        } catch (pollError: any) {
          console.error('轮询错误:', pollError)
          // 如果轮询失败，使用fallback
          throw pollError
        }
      }
      
    } catch (err: any) {
      console.error('设计生成错误:', err)
      const errorMessage = err.response?.data?.detail || err.message || '生成设计方案时出现错误'
      setError(errorMessage)
      
      // Check if it's a connection error
      const isConnectionError = err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || err.message?.includes('timeout')
      
      if (isConnectionError) {
        toast.error(language === 'zh' ? '无法连接到后端服务器' : 'Cannot connect to backend server', {
          duration: 5000,
        })
      } else {
        // Use fallback data for other errors
        toast.error(language === 'zh' ? `生成失败: ${errorMessage}` : `Generation failed: ${errorMessage}`, {
          duration: 5000,
        })
      }
      
      const fallbackDesigns = fallbackDesignsData[language] as DesignProposal[]
      setDesigns(fallbackDesigns)
      setSelectedDesign(fallbackDesigns[0])
    } finally {
      isGeneratingRef.current = false
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  // 组件加载时启动生成
  useEffect(() => {
    if (designs.length === 0) {
      generateDesigns()
    } else {
      setIsLoading(false)
      setIsGenerating(false)
    }
    
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current)
      }
    }
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const texts = {
    zh: {
      generating: 'AI正在为您创作设计方案...',
      analyzingPhoto: '正在分析房间照片...',
      generatingDesign: '正在生成设计方案...',
      progress: '生成进度',
      steps: ['分析设计需求', '生成设计理念', '渲染效果图', '匹配家具产品'],
      generated: '已生成',
      proposals: '个设计方案',
      yourDesign: '您的专属设计方案',
      designList: '设计方案',
      match: '匹配度',
      preview: '效果预览',
      shoppingList: '购物清单',
      original: '原始照片',
      designEffect: '设计效果',
      fullscreen: '全屏对比',
      download: '下载方案',
      share: '分享',
      save: '保存',
      regenerate: '重新生成',
      totalCost: '预估总费用',
      withinBudget: '在您的预算范围内！还剩余',
      overBudget: '超出预算',
      downloadPDF: '下载完整购物清单 (PDF)',
      buy: '购买',
      shareTitle: '分享设计方案',
      copyLink: '复制链接',
      preparing: '正在准备下载...',
      downloadSuccess: '下载成功！',
      downloadFailed: '下载失败，请重试',
      linkCopied: '链接已复制到剪贴板！',
      copyFailed: '复制失败',
      savedAccount: '设计已保存到您的账户！',
      savedLocal: '设计已保存到本地历史！',
      saveFailed: '保存失败',
      generateSuccess: '设计方案生成完成！',
      connectionError: '无法连接到后端服务器，请确保后端服务正在运行',
      generateFailed: '生成失败，显示示例方案',
    },
    en: {
      generating: 'AI is creating your design...',
      analyzingPhoto: 'Analyzing room photo...',
      generatingDesign: 'Generating design...',
      progress: 'Progress',
      steps: ['Analyzing requirements', 'Generating concepts', 'Rendering images', 'Matching furniture'],
      generated: 'Generated',
      proposals: 'design proposals',
      yourDesign: 'Your Custom Design',
      designList: 'Designs',
      match: 'Match',
      preview: 'Preview',
      shoppingList: 'Shopping List',
      original: 'Original Photo',
      designEffect: 'Design Effect',
      fullscreen: 'Full View',
      download: 'Download',
      share: 'Share',
      save: 'Save',
      regenerate: 'Regenerate',
      totalCost: 'Estimated Total',
      withinBudget: 'Within budget! Remaining:',
      overBudget: 'Over budget by',
      downloadPDF: 'Download Shopping List (PDF)',
      buy: 'Buy',
      shareTitle: 'Share Design',
      copyLink: 'Copy Link',
      preparing: 'Preparing download...',
      downloadSuccess: 'Download successful!',
      downloadFailed: 'Download failed, please retry',
      linkCopied: 'Link copied to clipboard!',
      copyFailed: 'Copy failed',
      savedAccount: 'Design saved to your account!',
      savedLocal: 'Design saved to local history!',
      saveFailed: 'Save failed',
      generateSuccess: 'Design generation complete!',
      connectionError: 'Cannot connect to backend server',
      generateFailed: 'Generation failed, showing sample designs',
    }
  }
  const txt = texts[language]
  
  // Use CAD formatting
  const formatCurrency = (value: number) => {
    return formatCAD(value)
  }

  const handleRegenerate = () => {
    setDesigns([])
    setSelectedDesign(null)
    generateDesigns()
  }

  // Download design as image
  const handleDownload = async () => {
    if (!selectedDesign) return
    
    try {
      toast.loading(language === 'zh' ? '正在准备下载...' : 'Preparing download...')
      
      // Fetch the image
      const response = await fetch(selectedDesign.image)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedDesign.name}-design.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success(language === 'zh' ? '下载成功！' : 'Download successful!')
    } catch (err) {
      toast.dismiss()
      toast.error(language === 'zh' ? '下载失败，请重试' : 'Download failed, please retry')
    }
  }

  // Generate share link
  const handleShare = async () => {
    if (!selectedDesign) return
    
    // Generate a simple share link (in production, this would be a real backend endpoint)
    const shareId = btoa(JSON.stringify({
      id: selectedDesign.id,
      name: selectedDesign.name,
      image: selectedDesign.image,
      timestamp: Date.now()
    })).slice(0, 20)
    
    const link = `${window.location.origin}/share/${shareId}`
    setShareLink(link)
    setShowShareModal(true)
  }

  // Copy share link
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success(language === 'zh' ? '链接已复制到剪贴板！' : 'Link copied to clipboard!')
    } catch (err) {
      toast.error(language === 'zh' ? '复制失败' : 'Copy failed')
    }
  }

  // Save design to history (backend + localStorage backup)
  const saveToHistory = async () => {
    if (!selectedDesign) return
    
    try {
      // Save to backend if authenticated
      if (isAuthenticated) {
        await designApi.save(selectedDesign.id)
      }
      
      // Also save to localStorage as backup
      const history = JSON.parse(localStorage.getItem('designHistory') || '[]')
      const newEntry = {
        ...selectedDesign,
        savedAt: new Date().toISOString(),
        originalImage: uploadedImage
      }
      
      // Avoid duplicates
      const filtered = history.filter((h: any) => h.id !== selectedDesign.id)
      filtered.unshift(newEntry)
      
      // Keep only last 20 designs
      const trimmed = filtered.slice(0, 20)
      localStorage.setItem('designHistory', JSON.stringify(trimmed))
      
      toast.success(isAuthenticated ? 'Design saved to your account!' : 'Design saved to local history!')
    } catch (error: any) {
      console.error('Failed to save design:', error)
      toast.error(error.response?.data?.detail || 'Failed to save design')
      
      // Fallback to localStorage only
      const history = JSON.parse(localStorage.getItem('designHistory') || '[]')
      const newEntry = {
        ...selectedDesign,
        savedAt: new Date().toISOString(),
        originalImage: uploadedImage
      }
      const filtered = history.filter((h: any) => h.id !== selectedDesign.id)
      filtered.unshift(newEntry)
      const trimmed = filtered.slice(0, 20)
      localStorage.setItem('designHistory', JSON.stringify(trimmed))
      toast.success('Design saved to local history!')
    }
  }

  // Loading state
  if (isLoading || isGenerating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          className="relative w-32 h-32 mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-4 rounded-full border-4 border-indigo-200 border-b-indigo-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>
        
        <h2 className="text-2xl font-display font-bold mb-4">
          {txt.generating}
        </h2>
        <p className="text-slate-600 max-w-md mb-2">
          {statusMessage}
        </p>
        
        {/* 进度条 */}
        <div className="w-full max-w-md mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">{txt.progress}</span>
            <span className="text-blue-600 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
          {txt.steps.map((label, i) => ({ label, threshold: [20, 45, 70, 90][i] })).map((step, i) => (
            <motion.div 
              key={step.label} 
              className="text-left"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: progress >= step.threshold ? 1 : 0.5 }}
            >
              <div className="flex items-center gap-2 text-sm mb-1">
                {progress >= step.threshold + 20 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : progress >= step.threshold ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                )}
                <span className={progress >= step.threshold ? 'text-slate-900' : 'text-slate-400'}>
                  {step.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>
    )
  }

  if (!selectedDesign) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4"
        >
          <Check className="w-4 h-4" />
          {txt.generated} {designs.length} {txt.proposals}
        </motion.div>
        <h2 className="text-3xl font-display font-bold">{txt.yourDesign}</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Design thumbnails */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">{txt.designList}</h3>
          {designs.map((design, index) => (
            <motion.button
              key={design.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedDesign(design)}
              className={`
                w-full p-4 rounded-xl text-left transition-all duration-200
                ${selectedDesign.id === design.id
                  ? 'bg-blue-50 ring-2 ring-blue-500'
                  : 'bg-white hover:bg-slate-50 border border-slate-100'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-slate-100">
                  <img 
                    src={design.image} 
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{design.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(design.id)
                      }}
                      className="p-1"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          favorites.includes(design.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{design.style}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-blue-600">
                      {formatCurrency(design.totalCost)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {txt.match} {Math.round(design.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Main preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('preview')}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium transition-colors
                  ${activeTab === 'preview'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                {txt.preview}
              </button>
              <button
                onClick={() => setActiveTab('furniture')}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium transition-colors
                  ${activeTab === 'furniture'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                {txt.shoppingList}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'preview' ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  {/* Before/After comparison */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm font-medium text-slate-500 mb-2 block">{txt.original}</span>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        {uploadedImage ? (
                          <img 
                            src={uploadedImage} 
                            alt="Original room" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span>{language === 'zh' ? '您上传的房间照片' : 'Your uploaded room photo'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-500 mb-2 block">{txt.designEffect}</span>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        <img 
                          src={selectedDesign.image} 
                          alt="AI Generated Design" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Design info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{selectedDesign.name}</h3>
                      <p className="text-slate-600">{selectedDesign.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedDesign.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <button 
                        onClick={() => setShowFullscreen(true)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Maximize2 className="w-5 h-5" />
                        {txt.fullscreen}
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        {txt.download}
                      </button>
                      <button 
                        onClick={handleShare}
                        className="btn-ghost flex items-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        {txt.share}
                      </button>
                      <button 
                        onClick={saveToHistory}
                        className="btn-ghost flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        {txt.save}
                      </button>
                      <button 
                        onClick={handleRegenerate}
                        className="btn-ghost flex items-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        {txt.regenerate}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="furniture"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  {/* Furniture list */}
                  <div className="space-y-4">
                    {selectedDesign.furniture.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingCart className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900">{item.name}</h4>
                            <p className="text-sm text-slate-500">
                              {item.brand} · {item.dimensions}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Multiple platform links */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.links && Array.isArray(item.links) ? (
                            item.links.map((link: any, linkIdx: number) => (
                              <a
                                key={linkIdx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                              >
                                <span>{link.icon}</span>
                                <span>{link.name}</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            ))
                          ) : item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              {txt.buy} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{txt.totalCost}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedDesign.totalCost)}
                    </span>
                  </div>

                  {/* Budget check */}
                  {preferences?.budget && (
                    <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                      selectedDesign.totalCost <= preferences.budget 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {selectedDesign.totalCost <= preferences.budget ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>{txt.withinBudget} {formatCurrency(preferences.budget - selectedDesign.totalCost)}</span>
                        </>
                      ) : (
                        <>
                          <span>{txt.overBudget} {formatCurrency(selectedDesign.totalCost - preferences.budget)}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Download shopping list */}
                  <button className="mt-6 w-full btn-primary justify-center">
                    <Download className="w-5 h-5 mr-2" />
                    {txt.downloadPDF}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Comparison Modal */}
      {showFullscreen && selectedDesign && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/80">
            <h3 className="text-white font-bold text-lg">{selectedDesign.name}</h3>
            <button
              onClick={() => setShowFullscreen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Images */}
          <div className="flex-1 flex items-center justify-center gap-4 p-4">
            {/* Original */}
            <div className="flex-1 flex flex-col items-center">
              <p className="text-white/60 text-sm mb-2">{txt.original}</p>
              <img 
                src={uploadedImage || '/placeholder-room.jpg'} 
                alt="Original" 
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>
            
            {/* Arrow */}
            <div className="text-white/40">
              <ChevronRight className="w-8 h-8" />
            </div>
            
            {/* Design Effect */}
            <div className="flex-1 flex flex-col items-center">
              <p className="text-white/60 text-sm mb-2">{txt.designEffect}</p>
              <img 
                src={selectedDesign.image} 
                alt="Design" 
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
          
          {/* Info */}
          <div className="p-4 bg-black/80 text-center">
            <p className="text-white/80">{selectedDesign.description}</p>
            <div className="flex justify-center gap-2 mt-2">
              {selectedDesign.highlights?.map((h: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">{h}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{txt.shareTitle}</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-600 mb-4">
              {language === 'zh' ? '复制下方链接分享给朋友，他们可以查看您的设计方案' : 'Copy the link below to share with friends'}
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 bg-slate-100 rounded-lg text-sm"
              />
              <button
                onClick={copyShareLink}
                className="btn-primary px-4"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(language === 'zh' ? '看看我用AI设计的房间！' : 'Check out my AI-designed room!')}`, '_blank')}
                className="flex-1 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Twitter
              </button>
              <button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank')}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={() => window.open(`weixin://`, '_blank')}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {language === 'zh' ? '微信' : 'WeChat'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
