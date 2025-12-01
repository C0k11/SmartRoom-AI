'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Compass, 
  Image, 
  Menu, 
  X,
  Sparkles,
  ShoppingBag,
  Zap,
  Globe,
  Clock
} from 'lucide-react'
import { CartButton } from '@/components/cart'
import { useLanguage } from '@/lib/i18n'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/design', label: t('nav.design'), icon: Sparkles },
    { href: '/history', label: language === 'zh' ? '历史记录' : 'History', icon: Clock },
    { href: '/explore', label: language === 'zh' ? '探索风格' : 'Explore', icon: Compass },
    { href: '/furniture', label: language === 'zh' ? '家具商城' : 'Furniture', icon: ShoppingBag },
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="glass rounded-2xl shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo - Cok11 */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-slate-800">Cok</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">11</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Right side */}
              <div className="hidden md:flex items-center gap-3">
                {/* Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  title={language === 'zh' ? 'Switch to English' : '切换到中文'}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {language === 'zh' ? 'EN' : '中文'}
                  </span>
                </button>
                
                <CartButton />
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-600 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/design"
                  className="btn-primary py-2"
                >
                  {language === 'zh' ? '免费体验' : 'Try Free'}
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center gap-2">
                {/* Mobile Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  title={language === 'zh' ? 'Switch to English' : '切换到中文'}
                >
                  <Globe className="w-5 h-5 text-slate-600" />
                </button>
                
                <button
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6 text-slate-600" />
                  ) : (
                    <Menu className="w-6 h-6 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-slate-200"
              >
                <div className="container mx-auto px-6 py-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      href="/design"
                      className="block w-full text-center btn-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {language === 'zh' ? '免费体验' : 'Try Free'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  )
}
