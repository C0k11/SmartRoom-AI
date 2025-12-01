'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Camera, 
  Palette, 
  Box, 
  ShoppingBag, 
  ArrowRight,
  Upload,
  Wand2,
  Eye,
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const features = [
  {
    icon: Camera,
    title: '智能房间分析',
    description: '上传照片，AI自动识别房间类型、家具布局、光线情况和潜在问题',
    color: 'primary',
  },
  {
    icon: Palette,
    title: '多风格设计生成',
    description: '一键生成现代简约、北欧、日式、工业风等多种风格的设计方案',
    color: 'accent',
  },
  {
    icon: Box,
    title: '3D沉浸预览',
    description: '在三维空间中自由浏览您的设计方案，任意角度查看效果',
    color: 'success',
  },
  {
    icon: ShoppingBag,
    title: '智能购物清单',
    description: '自动匹配真实家具，生成包含价格和购买链接的详细清单',
    color: 'primary',
  },
]

const steps = [
  {
    step: 1,
    icon: Upload,
    title: '上传房间照片',
    description: '拍摄或上传您想要改造的房间照片',
  },
  {
    step: 2,
    icon: Wand2,
    title: '选择偏好风格',
    description: '设定预算、选择喜欢的设计风格和色彩',
  },
  {
    step: 3,
    icon: Eye,
    title: '查看设计方案',
    description: 'AI生成多个专业设计方案供您选择',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 mesh-bg" />
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          
          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl floating" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-300/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-8"
              >
                <Zap className="w-4 h-4" />
                由 Cok11 团队倾力打造
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-6 text-slate-900"
              >
                用 <span className="gradient-text">AI</span> 重新定义
                <br />
                您的生活空间
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto"
              >
                上传房间照片，选择喜欢的风格，几秒钟内获得专业级室内设计方案
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link href="/design" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  开始设计
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/gallery" className="btn-secondary text-lg px-8 py-4">
                  查看案例
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center gap-12 mt-16"
              >
                {[
                  { value: '10K+', label: '设计方案' },
                  { value: '5K+', label: '满意用户' },
                  { value: '8+', label: '设计风格' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
                核心功能
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-900">
                AI 驱动的智能设计
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                结合前沿人工智能技术，为您提供专业级的室内设计解决方案
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="modern-card p-8 text-center group"
                >
                  <div className={`
                    w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                    transition-all duration-300 group-hover:scale-110
                    ${feature.color === 'primary' ? 'bg-primary-100 text-primary-600' : ''}
                    ${feature.color === 'accent' ? 'bg-accent-100 text-accent-600' : ''}
                    ${feature.color === 'success' ? 'bg-success-100 text-success-600' : ''}
                  `}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
                使用流程
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-900">
                三步完成设计
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                简单三步，即可获得专属于您的室内设计方案
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-accent-300" />
                  )}
                  
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                准备好改变您的空间了吗？
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                立即开始，让 AI 帮您打造梦想中的家
              </p>
              <Link 
                href="/design" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Sparkles className="w-5 h-5" />
                免费开始设计
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
                用户评价
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-900">
                他们都在用 Cok11
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: '张小明',
                  role: '室内设计爱好者',
                  content: '太神奇了！上传照片后几秒钟就能看到设计效果，省去了和设计师来回沟通的时间。',
                  rating: 5,
                },
                {
                  name: '李婷婷',
                  role: '新房业主',
                  content: '购物清单功能太实用了，直接链接到购买页面，家具搭配也很协调。',
                  rating: 5,
                },
                {
                  name: '王大力',
                  role: '室内设计师',
                  content: '作为专业设计师，这个工具帮我快速生成初稿，大大提高了工作效率。',
                  rating: 5,
                },
              ].map((review, index) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="modern-card p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6">{review.content}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                      {review.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{review.name}</div>
                      <div className="text-sm text-slate-500">{review.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
