'use client'

import { motion } from 'framer-motion'
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const plans = [
  {
    name: '免费版',
    nameEn: 'Free',
    price: 0,
    period: '永久免费',
    description: '体验AI设计的神奇魔力',
    icon: Sparkles,
    color: 'warmgray',
    features: [
      { text: '每月3次设计生成', included: true },
      { text: '基础风格选择（4种）', included: true },
      { text: '标准分辨率输出', included: true },
      { text: '基础家具推荐', included: true },
      { text: '3D预览', included: false },
      { text: 'AR体验', included: false },
      { text: '购物清单导出', included: false },
      { text: '优先客服支持', included: false },
    ],
    cta: '免费开始',
    ctaLink: '/design',
    popular: false,
  },
  {
    name: '专业版',
    nameEn: 'Pro',
    price: 29,
    period: '每月',
    description: '为追求完美的设计爱好者',
    icon: Zap,
    color: 'terracotta',
    features: [
      { text: '每月30次设计生成', included: true },
      { text: '全部风格选择（8种）', included: true },
      { text: '高清分辨率输出', included: true },
      { text: '智能家具推荐', included: true },
      { text: '3D预览', included: true },
      { text: 'AR体验', included: true },
      { text: '购物清单PDF导出', included: true },
      { text: '优先客服支持', included: false },
    ],
    cta: '升级专业版',
    ctaLink: '/login?plan=pro',
    popular: true,
  },
  {
    name: '旗舰版',
    nameEn: 'Premium',
    price: 79,
    period: '每月',
    description: '专业设计师和工作室的首选',
    icon: Crown,
    color: 'forest',
    features: [
      { text: '无限设计生成', included: true },
      { text: '全部风格 + 自定义风格', included: true },
      { text: '4K超高清输出', included: true },
      { text: '专业家具数据库', included: true },
      { text: '高级3D编辑', included: true },
      { text: 'AR + VR体验', included: true },
      { text: '完整项目报告导出', included: true },
      { text: '1对1专属客服', included: true },
    ],
    cta: '联系销售',
    ctaLink: '/contact',
    popular: false,
  },
]

const faqs = [
  {
    q: '可以随时取消订阅吗？',
    a: '是的，您可以随时取消订阅。取消后，您的账户将在当前计费周期结束后降级为免费版。',
  },
  {
    q: '支持哪些支付方式？',
    a: '我们支持微信支付、支付宝、银行卡（Visa/MasterCard）等多种支付方式。',
  },
  {
    q: '如果设计次数用完了怎么办？',
    a: '您可以升级到更高级的套餐，或者等待下个月额度刷新。旗舰版用户享有无限设计次数。',
  },
  {
    q: '生成的设计方案归谁所有？',
    a: '所有通过RoomAI生成的设计方案版权归您所有，您可以自由使用、分享或商用。',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warmgray-50">
      <Header />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-100 text-terracotta-700 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              简单透明的定价
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold mb-4"
            >
              选择适合您的方案
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-warmgray-600 max-w-2xl mx-auto"
            >
              从免费版开始体验，随时升级解锁更多功能
            </motion.p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-white rounded-2xl shadow-sm overflow-hidden ${
                  plan.popular ? 'ring-2 ring-terracotta-500 shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-terracotta-500 text-white text-center py-2 text-sm font-medium">
                    最受欢迎
                  </div>
                )}
                
                <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                    <plan.icon className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-warmgray-500 mb-4">{plan.nameEn}</p>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? '免费' : `¥${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-warmgray-500">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-warmgray-600 mb-6">{plan.description}</p>
                  
                  {/* CTA */}
                  <Link
                    href={plan.ctaLink}
                    className={`block w-full text-center py-3 rounded-xl font-medium transition-all ${
                      plan.popular
                        ? 'bg-terracotta-500 text-white hover:bg-terracotta-600'
                        : 'bg-warmgray-100 text-warmgray-700 hover:bg-warmgray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  
                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-warmgray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-warmgray-700' : 'text-warmgray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-warmgray-900 to-warmgray-800 rounded-2xl p-8 md:p-12 text-center mb-20"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
              企业定制方案
            </h2>
            <p className="text-warmgray-300 mb-8 max-w-2xl mx-auto">
              为大型设计公司、房地产开发商和家居品牌提供定制化解决方案，包括API接入、私有化部署等
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-warmgray-900 font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              联系我们
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              常见问题
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-warmgray-900 mb-2">{faq.q}</h3>
                  <p className="text-warmgray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

