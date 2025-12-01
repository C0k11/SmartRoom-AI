import type { Metadata } from 'next'
import { Outfit, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RoomAI - 智能室内设计助手',
  description: '使用AI技术，将您的房间照片转化为专业设计方案。支持多种风格、预算规划和3D预览。',
  keywords: ['室内设计', 'AI设计', '家居装修', '智能设计', '3D预览', 'AR体验'],
  authors: [{ name: 'RoomAI Team' }],
  openGraph: {
    title: 'RoomAI - 智能室内设计助手',
    description: '使用AI技术，将您的房间照片转化为专业设计方案',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${outfit.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-warmgray-50 text-warmgray-900">
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#292524',
                color: '#fafaf9',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#4d8a5c',
                  secondary: '#fafaf9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#e26d47',
                  secondary: '#fafaf9',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

