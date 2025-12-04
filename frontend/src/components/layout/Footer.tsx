'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="py-12 px-6 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">SmartRoom AI</span>
          </div>
          <div className="flex items-center gap-8 text-slate-500">
            <Link href="/about" className="hover:text-slate-900 transition">{t('footer.about')}</Link>
            <Link href="/docs" className="hover:text-slate-900 transition">{t('footer.docs')}</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition">{t('footer.privacy')}</Link>
          </div>
          <div className="text-slate-400 text-sm">
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  )
}
