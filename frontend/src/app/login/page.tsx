'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Github,
  Chrome,
  User,
  Zap,
  Sparkles,
  Shield,
  Palette,
  Box,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useLanguage } from '@/lib/i18n'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/design'
  
  const { login, register, loginWithOAuth, isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, router, redirect])

  const texts = {
    zh: {
      welcomeBack: '欢迎回来',
      createAccount: '创建账户',
      loginSubtitle: '登录您的账户，继续您的设计之旅',
      registerSubtitle: '注册账户，开始AI智能设计体验',
      continueWithGoogle: '使用 Google 继续',
      continueWithGithub: '使用 GitHub 继续',
      orEmail: '或使用邮箱',
      username: '用户名',
      yourName: '您的昵称',
      email: '邮箱地址',
      password: '密码',
      confirmPassword: '确认密码',
      rememberMe: '记住我',
      forgotPassword: '忘记密码？',
      login: '登录',
      register: '注册',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      registerNow: '立即注册',
      loginNow: '立即登录',
      heroTitle: '用AI重新定义\n您的生活空间',
      heroSubtitle: '上传照片，选择风格，几秒钟内获得专业设计方案',
      feature1: '智能房间分析',
      feature2: '多种设计风格',
      feature3: '3D预览体验',
      feature4: '安全数据保护',
      errors: {
        email: '请输入邮箱',
        emailFormat: '邮箱格式不正确',
        password: '请输入密码',
        passwordMin: '密码至少6位',
        name: '请输入用户名',
        confirmPassword: '两次密码不一致',
      },
      success: {
        login: '登录成功！',
        register: '注册成功！',
      }
    },
    en: {
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      loginSubtitle: 'Sign in to continue your design journey',
      registerSubtitle: 'Create an account to start AI-powered design',
      continueWithGoogle: 'Continue with Google',
      continueWithGithub: 'Continue with GitHub',
      orEmail: 'or use email',
      username: 'Username',
      yourName: 'Your name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      login: 'Sign In',
      register: 'Sign Up',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      registerNow: 'Sign Up',
      loginNow: 'Sign In',
      heroTitle: 'Reimagine Your\nLiving Space with AI',
      heroSubtitle: 'Upload a photo, choose a style, get professional designs in seconds',
      feature1: 'Smart Room Analysis',
      feature2: 'Multiple Design Styles',
      feature3: '3D Preview',
      feature4: 'Secure Data Protection',
      errors: {
        email: 'Please enter email',
        emailFormat: 'Invalid email format',
        password: 'Please enter password',
        passwordMin: 'Password must be at least 6 characters',
        name: 'Please enter username',
        confirmPassword: 'Passwords do not match',
      },
      success: {
        login: 'Login successful!',
        register: 'Registration successful!',
      }
    }
  }
  
  const txt = texts[language]

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.email) {
      newErrors.email = txt.errors.email
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = txt.errors.emailFormat
    }
    
    if (!formData.password) {
      newErrors.password = txt.errors.password
    } else if (formData.password.length < 6) {
      newErrors.password = txt.errors.passwordMin
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = txt.errors.name
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = txt.errors.confirmPassword
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      let success = false
      
      if (isLogin) {
        success = await login(formData.email, formData.password)
      } else {
        success = await register(formData.email, formData.password, formData.name)
      }
      
      if (success) {
        toast.success(isLogin ? txt.success.login : txt.success.register)
        router.push(redirect)
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    
    try {
      const success = await loginWithOAuth(provider)
      if (success) {
        toast.success(txt.success.login)
        router.push(redirect)
      }
    } catch (error) {
      console.error('OAuth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Sparkles, text: txt.feature1 },
    { icon: Palette, text: txt.feature2 },
    { icon: Box, text: txt.feature3 },
    { icon: Shield, text: txt.feature4 },
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium text-sm">
            {language === 'zh' ? 'EN' : '中文'}
          </span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-slate-800">Cok</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">11</span>
            </span>
          </Link>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            {isLogin ? txt.welcomeBack : txt.createAccount}
          </h1>
          <p className="text-slate-500 mb-8">
            {isLogin ? txt.loginSubtitle : txt.registerSubtitle}
          </p>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">{txt.continueWithGoogle}</span>
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">{txt.continueWithGithub}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">{txt.orEmail}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field - only for register */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {txt.username}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={txt.yourName}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`input-primary pl-12 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {txt.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input-primary pl-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {txt.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`input-primary pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password - only for register */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {txt.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`input-primary pl-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </motion.div>
            )}

            {/* Remember me & Forgot password - only for login */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-slate-600">{txt.rememberMe}</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  {txt.forgotPassword}
                </Link>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? txt.login : txt.register}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle login/register */}
          <p className="mt-8 text-center text-slate-600">
            {isLogin ? txt.noAccount : txt.hasAccount}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setErrors({})
                setFormData({ email: '', password: '', name: '', confirmPassword: '' })
              }}
              className="ml-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              {isLogin ? txt.registerNow : txt.loginNow}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right side - Design showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-white text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight whitespace-pre-line">
              {txt.heroTitle}
            </h2>
            <p className="text-xl text-white/80 mb-12">
              {txt.heroSubtitle}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 text-left bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
