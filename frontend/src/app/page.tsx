'use client'

import { motion } from 'framer-motion'
import { 
  Camera, 
  Palette, 
  Box, 
  ShoppingBag, 
  ArrowRight,
  Upload,
  Wand2,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useLanguage } from '@/lib/i18n'

export default function Home() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Camera,
      title: t('home.feature.analysis.title'),
      description: t('home.feature.analysis.desc'),
      color: 'primary',
    },
    {
      icon: Palette,
      title: t('home.feature.styles.title'),
      description: t('home.feature.styles.desc'),
      color: 'accent',
    },
    {
      icon: Box,
      title: t('home.feature.3d.title'),
      description: t('home.feature.3d.desc'),
      color: 'success',
    },
    {
      icon: ShoppingBag,
      title: t('home.feature.shopping.title'),
      description: t('home.feature.shopping.desc'),
      color: 'primary',
    },
  ]

  const steps = [
    {
      step: 1,
      icon: Upload,
      title: t('home.step1.title'),
      description: t('home.step1.desc'),
    },
    {
      step: 2,
      icon: Wand2,
      title: t('home.step2.title'),
      description: t('home.step2.desc'),
    },
    {
      step: 3,
      icon: Eye,
      title: t('home.step3.title'),
      description: t('home.step3.desc'),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - GitHub style */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
                {t('home.hero.title1')}
                <br />
                <span className="text-blue-600">{t('home.hero.title2')}</span>
              </h1>
            
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex items-center justify-center gap-4">
                <Link 
                  href="/design"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  {t('home.hero.cta')}
                </Link>
                <Link 
                  href="/explore"
                  className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium rounded-md transition-colors"
                >
                  {t('home.hero.cta2')}
                </Link>
              </div>
            </motion.div>

            {/* Stats - realistic for demo */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center gap-12 mt-16"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">8+</div>
                <div className="text-sm text-slate-500">{t('home.stats.styles')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">3</div>
                <div className="text-sm text-slate-500">{t('home.stats.models')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">Demo</div>
                <div className="text-sm text-slate-500">{t('home.stats.demo')}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">{t('home.features.label')}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-900">{t('home.features.title')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="modern-card p-8 text-center group"
              >
                <div className={`
                  w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                  transition-all duration-300 group-hover:scale-110
                  ${feature.color === 'primary' ? 'bg-blue-100 text-blue-600' : ''}
                  ${feature.color === 'accent' ? 'bg-indigo-100 text-indigo-600' : ''}
                  ${feature.color === 'success' ? 'bg-emerald-100 text-emerald-600' : ''}
                `}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">{t('home.steps.label')}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-900">{t('home.steps.title')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('home.steps.subtitle')}
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
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-slate-200" />
                )}
                
                <div className="text-center relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-4">
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
      <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">{t('home.cta.title')}</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/design"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {t('home.hero.cta')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
