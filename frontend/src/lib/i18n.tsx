'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'zh' | 'en'

interface Translations {
  [key: string]: {
    zh: string
    en: string
  }
}

// Translation dictionary
export const translations: Translations = {
  // Navigation
  'nav.home': { zh: '首页', en: 'Home' },
  'nav.design': { zh: '开始设计', en: 'Design' },
  'nav.history': { zh: '历史记录', en: 'History' },
  'nav.explore': { zh: '探索风格', en: 'Explore' },
  'nav.furniture': { zh: '家具商城', en: 'Furniture' },
  'nav.gallery': { zh: '灵感库', en: 'Gallery' },
  'nav.pricing': { zh: '价格', en: 'Pricing' },
  'nav.login': { zh: '登录', en: 'Sign in' },
  'nav.register': { zh: '注册', en: 'Register' },
  'nav.logout': { zh: '登出', en: 'Sign out' },
  
  // Home page
  'home.hero.title1': { zh: 'AI 驱动的', en: 'AI-Powered' },
  'home.hero.title2': { zh: '室内设计助手', en: 'Interior Design Assistant' },
  'home.hero.subtitle': { zh: '上传房间照片，选择喜欢的风格，几秒钟内获得专业级室内设计方案。支持3D预览和智能购物清单。', en: 'Upload a room photo, choose your preferred style, get professional interior design proposals in seconds. Supports 3D preview and smart shopping lists.' },
  'home.hero.cta': { zh: '开始设计', en: 'Start Design' },
  'home.hero.cta2': { zh: '探索风格', en: 'Explore Styles' },
  'home.stats.styles': { zh: '设计风格', en: 'Design Styles' },
  'home.stats.models': { zh: 'AI 模型', en: 'AI Models' },
  'home.stats.demo': { zh: '开发阶段', en: 'Development' },
  'home.features.title': { zh: '功能特点', en: 'Features' },
  'home.features.label': { zh: '核心功能', en: 'Core Features' },
  'home.features.subtitle': { zh: '结合前沿人工智能技术，为您提供专业级的室内设计解决方案', en: 'Combining cutting-edge AI technology to provide professional interior design solutions' },
  'home.feature.analysis.title': { zh: '智能房间分析', en: 'Smart Room Analysis' },
  'home.feature.analysis.desc': { zh: '上传照片，AI自动识别房间类型、家具布局、光线情况和潜在问题', en: 'Upload photos, AI automatically identifies room type, furniture layout, lighting, and potential issues' },
  'home.feature.styles.title': { zh: '多风格设计生成', en: 'Multi-Style Generation' },
  'home.feature.styles.desc': { zh: '一键生成现代简约、北欧、日式、工业风等多种风格的设计方案', en: 'Generate modern, Nordic, Japanese, industrial and other design styles with one click' },
  'home.feature.3d.title': { zh: '3D沉浸预览', en: '3D Immersive Preview' },
  'home.feature.3d.desc': { zh: '在三维空间中自由浏览您的设计方案，任意角度查看效果', en: 'Freely browse your designs in 3D space, view from any angle' },
  'home.feature.shopping.title': { zh: '智能购物清单', en: 'Smart Shopping List' },
  'home.feature.shopping.desc': { zh: '自动匹配真实家具，生成包含价格和购买链接的详细清单', en: 'Auto-match real furniture, generate detailed lists with prices and purchase links' },
  'home.steps.label': { zh: '使用流程', en: 'How it works' },
  'home.steps.title': { zh: '三步完成设计', en: 'Design in 3 Steps' },
  'home.steps.subtitle': { zh: '简单三步，即可获得专属于您的室内设计方案', en: 'Get your personalized interior design in just 3 simple steps' },
  'home.step1.title': { zh: '上传房间照片', en: 'Upload Room Photo' },
  'home.step1.desc': { zh: '拍摄或上传您想要改造的房间照片', en: 'Take or upload a photo of the room you want to redesign' },
  'home.step2.title': { zh: '选择偏好风格', en: 'Choose Preferred Style' },
  'home.step2.desc': { zh: '设定预算、选择喜欢的设计风格和色彩', en: 'Set budget, choose your favorite design style and colors' },
  'home.step3.title': { zh: '查看设计方案', en: 'View Design Proposals' },
  'home.step3.desc': { zh: 'AI生成多个专业设计方案供您选择', en: 'AI generates multiple professional designs for you to choose' },
  'home.cta.title': { zh: '准备好改变您的空间了吗？', en: 'Ready to transform your space?' },
  'home.cta.subtitle': { zh: '立即开始，让 AI 帮您打造梦想中的家', en: 'Start now and let AI help you create your dream home' },
  
  // Design page
  'design.step1.title': { zh: '上传照片', en: 'Upload Photo' },
  'design.step1.desc': { zh: '拍摄或上传房间照片', en: 'Take or upload a room photo' },
  'design.step2.title': { zh: '选择风格', en: 'Choose Style' },
  'design.step2.desc': { zh: '选择您喜欢的设计风格', en: 'Select your preferred design style' },
  'design.step3.title': { zh: '设置偏好', en: 'Set Preferences' },
  'design.step3.desc': { zh: '设定预算和特殊需求', en: 'Set budget and special requirements' },
  'design.step4.title': { zh: '生成设计', en: 'Generate Design' },
  'design.step4.desc': { zh: '查看AI生成的设计方案', en: 'View AI-generated design proposals' },
  
  'design.upload.title': { zh: '上传房间照片', en: 'Upload Room Photo' },
  'design.upload.subtitle': { zh: '上传一张清晰的房间照片，AI将自动分析房间布局和特征', en: 'Upload a clear room photo, AI will analyze the layout and features' },
  'design.analysis.title': { zh: '房间分析', en: 'Room Analysis' },
  'design.analysis.subtitle': { zh: 'AI将识别房间类型、现有家具和设计潜力', en: 'AI will identify room type, furniture, and design potential' },
  
  'design.tips.title': { zh: '拍照小贴士', en: 'Photo Tips' },
  'design.tips.1': { zh: '尽量拍摄房间的全景', en: 'Capture the full room view' },
  'design.tips.2': { zh: '保持照片水平，避免倾斜', en: 'Keep the photo level, avoid tilting' },
  'design.tips.3': { zh: '确保光线充足', en: 'Ensure good lighting' },
  'design.tips.4': { zh: '清理杂物，展示真实布局', en: 'Clear clutter, show real layout' },
  
  'design.style.title': { zh: '选择设计风格', en: 'Choose Design Style' },
  'design.style.subtitle': { zh: '选择您喜欢的设计风格，AI将基于此生成多个设计方案', en: 'Select your preferred style, AI will generate multiple proposals' },
  
  'design.preferences.title': { zh: '设置您的偏好', en: 'Set Your Preferences' },
  'design.preferences.subtitle': { zh: '告诉我们您的预算和特殊需求', en: 'Tell us your budget and special needs' },
  
  'design.back': { zh: '返回首页', en: 'Back to Home' },
  'design.prev': { zh: '上一步', en: 'Previous' },
  'design.next': { zh: '下一步', en: 'Next' },
  'design.generate': { zh: '生成设计方案', en: 'Generate Design' },
  
  // Analysis result
  'analysis.complete': { zh: '分析完成', en: 'Analysis Complete' },
  'analysis.confidence': { zh: '置信度', en: 'Confidence' },
  'analysis.roomType': { zh: '房间类型', en: 'Room Type' },
  'analysis.dimensions': { zh: '估计尺寸', en: 'Estimated Size' },
  'analysis.furniture': { zh: '现有家具', en: 'Existing Furniture' },
  'analysis.style': { zh: '当前风格', en: 'Current Style' },
  'analysis.lighting': { zh: '光线情况', en: 'Lighting' },
  'analysis.problems': { zh: '发现问题', en: 'Issues Found' },
  'analysis.potential': { zh: '设计潜力', en: 'Design Potential' },
  
  // Room types
  'room.living': { zh: '客厅', en: 'Living Room' },
  'room.bedroom': { zh: '卧室', en: 'Bedroom' },
  'room.kitchen': { zh: '厨房', en: 'Kitchen' },
  'room.bathroom': { zh: '卫生间', en: 'Bathroom' },
  'room.office': { zh: '书房/办公室', en: 'Office' },
  'room.other': { zh: '其他', en: 'Other' },
  
  // Design results
  'results.title': { zh: '您的专属设计方案', en: 'Your Custom Design Proposals' },
  'results.generated': { zh: '已生成', en: 'Generated' },
  'results.proposals': { zh: '个设计方案', en: 'design proposals' },
  'results.designs': { zh: '设计方案', en: 'Design Proposals' },
  'results.preview': { zh: '效果预览', en: 'Preview' },
  'results.shopping': { zh: '购物清单', en: 'Shopping List' },
  'results.original': { zh: '原始照片', en: 'Original Photo' },
  'results.effect': { zh: '设计效果', en: 'Design Effect' },
  'results.match': { zh: '匹配度', en: 'Match' },
  'results.3dPreview': { zh: '3D预览', en: '3D Preview' },
  'results.download': { zh: '下载方案', en: 'Download' },
  'results.share': { zh: '分享', en: 'Share' },
  'results.regenerate': { zh: '重新生成', en: 'Regenerate' },
  'results.totalCost': { zh: '预估总费用', en: 'Estimated Total' },
  'results.buy': { zh: '购买', en: 'Buy' },
  'results.downloadList': { zh: '下载完整购物清单 (PDF)', en: 'Download Shopping List (PDF)' },
  'results.inBudget': { zh: '在您的预算范围内！还剩余', en: 'Within budget! Remaining:' },
  'results.overBudget': { zh: '超出预算', en: 'Over budget by' },
  
  // Budget
  'budget.title': { zh: '设定预算', en: 'Set Budget' },
  'budget.range': { zh: '预算范围', en: 'Budget Range' },
  'budget.currency': { zh: 'CAD', en: 'CAD' },
  
  // Styles
  'style.modern': { zh: '现代简约', en: 'Modern Minimalist' },
  'style.nordic': { zh: '北欧风格', en: 'Nordic' },
  'style.japanese': { zh: '日式禅风', en: 'Japanese Zen' },
  'style.industrial': { zh: '工业风格', en: 'Industrial' },
  'style.bohemian': { zh: '波西米亚', en: 'Bohemian' },
  'style.midcentury': { zh: '中古世纪', en: 'Mid-Century' },
  'style.coastal': { zh: '海岸风格', en: 'Coastal' },
  'style.farmhouse': { zh: '现代农舍', en: 'Modern Farmhouse' },
  
  // Common
  'common.loading': { zh: '加载中...', en: 'Loading...' },
  'common.error': { zh: '出错了', en: 'Error' },
  'common.retry': { zh: '重试', en: 'Retry' },
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.confirm': { zh: '确认', en: 'Confirm' },
  'common.save': { zh: '保存', en: 'Save' },
  'common.uploaded': { zh: '已上传', en: 'Uploaded' },
  
  // Footer
  'footer.product': { zh: '产品', en: 'Product' },
  'footer.company': { zh: '公司', en: 'Company' },
  'footer.support': { zh: '支持', en: 'Support' },
  'footer.legal': { zh: '法律', en: 'Legal' },
  'footer.about': { zh: '关于', en: 'About' },
  'footer.docs': { zh: '文档', en: 'Docs' },
  'footer.privacy': { zh: '隐私', en: 'Privacy' },
  'footer.copyright': { zh: '2024 Cok11 - Demo', en: '2024 Cok11 - Demo' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  useEffect(() => {
    // Check localStorage for saved language preference
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'zh' || saved === 'en')) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
    return translation[language]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Currency formatter for CAD
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
  }).format(amount)
}

