'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2,
  Check,
  Home,
  Sofa,
  Utensils,
  Bed,
  Bath,
  Briefcase,
  LogIn
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { StyleSelector } from '@/components/design/StyleSelector'
import { BudgetSelector } from '@/components/design/BudgetSelector'
import { PreferencesForm } from '@/components/design/PreferencesForm'
import { AnalysisResult } from '@/components/design/AnalysisResult'
import { DesignResults } from '@/components/design/DesignResults'
import { useDesignStore } from '@/store/designStore'
import { useAuth } from '@/lib/auth'
import { useLanguage } from '@/lib/i18n'

export default function DesignPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { language, t } = useLanguage()
  
  const [currentStep, setCurrentStep] = useState(1)
  const { 
    uploadedImage, 
    setUploadedImage, 
    isAnalyzing,
    setIsAnalyzing,
    analysis,
    setAnalysis,
    selectedStyle,
    preferences,
    updatePreferences,
    isGenerating,
    designs,
    setDesigns,
    setSelectedDesign
  } = useDesignStore()

  // Texts for both languages
  const texts = {
    zh: {
      steps: [
        { id: 1, title: '上传照片', description: '拍摄或上传房间照片' },
        { id: 2, title: '选择风格', description: '选择您喜欢的设计风格' },
        { id: 3, title: '设置偏好', description: '设定预算和特殊需求' },
        { id: 4, title: '生成设计', description: '查看AI生成的设计方案' },
      ],
      backHome: '返回首页',
      prev: '上一步',
      next: '下一步',
      generate: '生成设计方案',
      uploadTitle: '上传房间照片',
      uploadDesc: '上传一张清晰的房间照片，AI将自动分析房间布局和特征',
      analysisTitle: '房间分析',
      analysisDesc: 'AI将识别房间类型、现有家具和设计潜力',
      tips: {
        title: '📸 拍照小贴士',
        items: ['尽量拍摄房间的全景', '保持照片水平，避免倾斜', '确保光线充足', '清理杂物，展示真实布局']
      },
      styleTitle: '选择设计风格',
      styleDesc: '选择您喜欢的设计风格，AI将基于此生成多个设计方案',
      prefTitle: '设置您的偏好',
      prefDesc: '告诉我们您的预算和特殊需求',
      loginRequired: '请登录后使用AI设计功能',
      loginButton: '立即登录',
    },
    en: {
      steps: [
        { id: 1, title: 'Upload Photo', description: 'Take or upload a room photo' },
        { id: 2, title: 'Choose Style', description: 'Select your preferred design style' },
        { id: 3, title: 'Set Preferences', description: 'Set budget and special requirements' },
        { id: 4, title: 'Generate Design', description: 'View AI-generated design proposals' },
      ],
      backHome: 'Back to Home',
      prev: 'Previous',
      next: 'Next',
      generate: 'Generate Design',
      uploadTitle: 'Upload Room Photo',
      uploadDesc: 'Upload a clear room photo, AI will analyze the layout and features',
      analysisTitle: 'Room Analysis',
      analysisDesc: 'AI will identify room type, furniture, and design potential',
      tips: {
        title: '📸 Photo Tips',
        items: ['Capture full room view', 'Keep photo level', 'Ensure good lighting', 'Clear clutter, show real layout']
      },
      styleTitle: 'Choose Design Style',
      styleDesc: 'Select your preferred style, AI will generate multiple proposals',
      prefTitle: 'Set Your Preferences',
      prefDesc: 'Tell us your budget and special needs',
      loginRequired: 'Please login to use AI design features',
      loginButton: 'Login Now',
    }
  }
  
  const txt = texts[language]
  const steps = txt.steps

  const handleImageUpload = async (file: File, preview: string) => {
    // Clear previous designs when uploading new image
    setDesigns([])
    setSelectedDesign(null)
    
    setUploadedImage(preview)
    setIsAnalyzing(true)
    
    try {
      // Call real API for room analysis
      const { analysisApi } = await import('@/lib/api')
      
      // Upload image to backend
      const uploadResult = await analysisApi.uploadImage(file)
      const jobId = uploadResult.id
      
      // Poll for analysis result
      let attempts = 0
      const maxAttempts = 30
      
      const pollStatus = async () => {
        attempts++
        const status = await analysisApi.getStatus(jobId)
        
        if (status.status === 'completed' && status.result) {
          const result = status.result
          setAnalysis({
            roomType: result.room_type || 'living',
            dimensions: result.dimensions || { width: 4.0, length: 5.0, height: 2.8 },
            existingFurniture: result.existing_furniture || [],
            currentStyle: result.current_style || '未识别',
            lighting: result.lighting || '一般',
            problems: result.problems || [],
            potential: result.potential || '有改造空间',
            confidence: result.confidence || 0.7
          })
          setIsAnalyzing(false)
        } else if (status.status === 'failed') {
          console.error('Analysis failed:', status.error)
          // Use fallback data on error
          setAnalysis({
            roomType: 'living',
            dimensions: { width: 4.0, length: 5.0, height: 2.8 },
            existingFurniture: [],
            currentStyle: '待分析',
            lighting: '需要更多信息',
            problems: ['需要上传更清晰的图片'],
            potential: '等待分析完成',
            confidence: 0.5
          })
          setIsAnalyzing(false)
        } else if (attempts < maxAttempts) {
          // Continue polling
          setTimeout(pollStatus, 2000)
        } else {
          // Timeout - use fallback
          setAnalysis({
            roomType: 'living',
            dimensions: { width: 4.0, length: 5.0, height: 2.8 },
            existingFurniture: [],
            currentStyle: '分析超时',
            lighting: '请重试',
            problems: ['分析超时，请重新上传'],
            potential: '请重新上传图片',
            confidence: 0.3
          })
          setIsAnalyzing(false)
        }
      }
      
      // Start polling after a short delay
      setTimeout(pollStatus, 1000)
      
    } catch (error) {
      console.error('Upload failed:', error)
      // Fallback to mock data on error
      setAnalysis({
        roomType: 'living',
        dimensions: { width: 4.0, length: 5.0, height: 2.8 },
        existingFurniture: [],
        currentStyle: 'API连接失败',
        lighting: '请检查网络',
        problems: ['无法连接到分析服务'],
        potential: '请确保后端服务正在运行',
        confidence: 0.0
      })
      setIsAnalyzing(false)
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setAnalysis(null)
    // Clear designs when removing image
    setDesigns([])
    setSelectedDesign(null)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!analysis && !isAnalyzing
      case 2:
        return !!selectedStyle
      case 3:
        return !!preferences.budget
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  // Show login required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-md mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-4">
                  {txt.loginRequired}
                </h1>
                <p className="text-slate-600 mb-8">
                  {language === 'zh' 
                    ? '登录后即可使用AI智能设计功能，上传房间照片获取专业设计方案' 
                    : 'Login to use AI design features, upload room photos to get professional design proposals'}
                </p>
                <Link
                  href="/login?redirect=/design"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {txt.loginButton}
                </Link>
              </motion.div>
            </div>
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
            <Link href="/" className="inline-flex items-center gap-2 text-warmgray-500 hover:text-terracotta-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div 
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
                          transition-all duration-300
                          ${currentStep > step.id 
                            ? 'bg-forest-500 text-white' 
                            : currentStep === step.id
                              ? 'bg-terracotta-500 text-white shadow-lg shadow-terracotta-500/30'
                              : 'bg-warmgray-200 text-warmgray-500'
                          }
                        `}
                      >
                        {currentStep > step.id ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        currentStep >= step.id ? 'text-warmgray-900' : 'text-warmgray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-20 lg:w-32 h-1 mx-2 rounded-full transition-colors duration-300
                        ${currentStep > step.id ? 'bg-forest-500' : 'bg-warmgray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Upload Section */}
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-2">上传房间照片</h2>
                    <p className="text-warmgray-600 mb-6">
                      上传一张清晰的房间照片，AI将自动分析房间布局和特征
                    </p>
                    
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      isUploading={isAnalyzing}
                      uploadedImage={uploadedImage}
                      onRemove={handleRemoveImage}
                    />

                    {/* Room Description - 房间自定义词条 */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">🏠 房间描述（帮助AI更准确分析）</h4>
                      <p className="text-sm text-blue-600 mb-3">
                        描述这个房间的实际情况，AI会结合您的描述进行分析和设计
                      </p>
                      <textarea
                        value={preferences.roomDescription || ''}
                        onChange={(e) => updatePreferences('roomDescription', e.target.value)}
                        placeholder="例如：这是一个带窗户的空仓库，水泥地面，准备改造成农具存放间..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                      />
                    </div>

                    {/* Tips */}
                    <div className="mt-4 p-4 bg-ocean-50 rounded-xl border border-ocean-100">
                      <h4 className="font-semibold text-ocean-800 mb-2">📸 拍照小贴士</h4>
                      <ul className="text-sm text-ocean-700 space-y-1">
                        <li>• 尽量拍摄房间的全景</li>
                        <li>• 保持照片水平，避免倾斜</li>
                        <li>• 确保光线充足</li>
                        <li>• 清理杂物，展示真实布局</li>
                      </ul>
                    </div>
                  </div>

                  {/* Analysis Result */}
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-2">房间分析</h2>
                    <p className="text-warmgray-600 mb-6">
                      AI将识别房间类型、现有家具和设计潜力
                    </p>
                    
                    <AnalysisResult 
                      analysis={analysis} 
                      isLoading={isAnalyzing} 
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-display font-bold mb-2">选择设计风格</h2>
                    <p className="text-warmgray-600">
                      选择您喜欢的设计风格，AI将基于此生成多个设计方案
                    </p>
                  </div>
                  
                  <StyleSelector />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-display font-bold mb-2">设置您的偏好</h2>
                    <p className="text-warmgray-600">
                      告诉我们您的预算和特殊需求
                    </p>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <BudgetSelector />
                    <PreferencesForm />
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <DesignResults />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-warmgray-200">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                    ${currentStep === 1
                      ? 'text-warmgray-300 cursor-not-allowed'
                      : 'text-warmgray-600 hover:bg-warmgray-100'
                    }
                  `}
                >
                  <ArrowLeft className="w-5 h-5" />
                  上一步
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`
                    flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all
                    ${canProceed()
                      ? 'btn-primary'
                      : 'bg-warmgray-200 text-warmgray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {currentStep === 3 ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      生成设计方案
                    </>
                  ) : (
                    <>
                      下一步
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

