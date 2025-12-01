'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-4">
      <div className="skeleton-image" />
      <div className="space-y-2">
        <div className="skeleton-title" />
        <div className="skeleton-text w-full" />
        <div className="skeleton-text w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonDesignResult() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="skeleton h-8 w-48 mx-auto rounded-full" />
        <div className="skeleton h-10 w-64 mx-auto" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left sidebar */}
        <div className="space-y-4">
          <div className="skeleton h-6 w-24" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
              <div className="skeleton w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-title" />
                <div className="skeleton-text w-20" />
                <div className="skeleton-text w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="flex border-b">
              <div className="skeleton h-12 w-1/2" />
              <div className="skeleton h-12 w-1/2" />
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="skeleton-image" />
                <div className="skeleton-image" />
              </div>
              <div className="space-y-2">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text w-3/4" />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonAnalysis() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="skeleton-avatar" />
        <div className="space-y-2 flex-1">
          <div className="skeleton-title" />
          <div className="skeleton-text w-1/2" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="skeleton-text w-20" />
            <div className="skeleton h-6 w-full" />
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="skeleton-text w-24" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  }
  
  return (
    <div className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  )
}

export function LoadingOverlay({ message = '加载中...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-slate-600 font-medium">{message}</p>
    </motion.div>
  )
}

export function ProgressBar({ progress, showLabel = true }: { progress: number; showLabel?: boolean }) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">进度</span>
          <span className="text-blue-600 font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

