'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Home, 
  Compass, 
  Menu, 
  X,
  Sparkles,
  ShoppingBag,
  Globe,
  Clock,
  User,
  LogOut
} from 'lucide-react'
import { CartButton } from '@/components/cart'
import { useLanguage } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/design', label: t('nav.design') },
    { href: '/history', label: t('nav.history') },
    { href: '/explore', label: t('nav.explore') },
    { href: '/furniture', label: t('nav.furniture') },
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Cok11 */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-slate-900">Cok</span>
              <span className="text-blue-600">11</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'zh' ? 'EN' : '中文'}
              </span>
            </button>
            
            <CartButton />
            
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout()
                    router.push('/')
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                  title={language === 'zh' ? '登出' : 'Logout'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-md font-medium transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Globe className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="container mx-auto px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-200 space-y-1">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-3 text-slate-700">
                      <User className="w-5 h-5" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                        router.push('/')
                      }}
                      className="block w-full text-left px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md font-medium transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-3 bg-slate-900 text-white rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
