'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Camera, 
  X, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Move,
  Check,
  AlertCircle
} from 'lucide-react'

interface ARPreviewProps {
  furnitureId?: string
  furnitureName?: string
  modelUrl?: string
  onClose?: () => void
}

export function ARPreview({ 
  furnitureId, 
  furnitureName = '家具',
  modelUrl,
  onClose 
}: ARPreviewProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check for WebXR support
    const checkSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr.isSessionSupported('immersive-ar')
          setIsSupported(supported)
        } catch {
          setIsSupported(false)
        }
      } else {
        setIsSupported(false)
      }
    }
    
    checkSupport()
  }, [])

  const startARSession = async () => {
    if (!isSupported) {
      setStatus('error')
      return
    }

    setStatus('loading')

    try {
      // Request camera access for preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // In a real implementation, we would start a WebXR session here
      // const session = await navigator.xr.requestSession('immersive-ar', {
      //   requiredFeatures: ['hit-test', 'dom-overlay'],
      //   domOverlay: { root: document.getElementById('ar-overlay') }
      // })

      setStatus('active')
      setIsActive(true)
    } catch (error) {
      console.error('AR session failed:', error)
      setStatus('error')
    }
  }

  const stopARSession = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setStatus('idle')
  }

  if (isSupported === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative h-full bg-warmgray-900 rounded-2xl overflow-hidden">
      {/* Video feed / AR view */}
      {isActive ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* AR Overlay */}
          <div id="ar-overlay" className="absolute inset-0 pointer-events-none">
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-white/50 rounded-full" />
              <div className="absolute w-6 h-0.5 bg-white/70" />
              <div className="absolute w-0.5 h-6 bg-white/70" />
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-20 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full inline-block">
                点击地面放置 {furnitureName}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 pointer-events-auto">
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <RotateCcw className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Move className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <ZoomIn className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <ZoomOut className="w-6 h-6" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={stopARSession}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Take photo button */}
          <button className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="w-12 h-12 border-4 border-warmgray-300 rounded-full" />
          </button>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          {!isSupported ? (
            // Not supported view
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 mx-auto bg-warmgray-800 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-warmgray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">设备不支持AR</h3>
              <p className="text-warmgray-400 mb-6 max-w-sm">
                您的设备或浏览器不支持WebXR AR功能。请使用支持AR的移动设备或浏览器。
              </p>
              <div className="text-sm text-warmgray-500">
                <p>支持的设备：</p>
                <ul className="mt-2 space-y-1">
                  <li>• iOS 12+ Safari (需要ARKit支持)</li>
                  <li>• Android Chrome (需要ARCore支持)</li>
                </ul>
              </div>
            </motion.div>
          ) : status === 'error' ? (
            // Error view
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 mx-auto bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">启动失败</h3>
              <p className="text-warmgray-400 mb-6">
                无法启动AR会话，请检查相机权限或稍后重试。
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-secondary"
              >
                重试
              </button>
            </motion.div>
          ) : status === 'loading' ? (
            // Loading view
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-terracotta-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-terracotta-500 rounded-full animate-spin" />
                <Camera className="absolute inset-0 m-auto w-8 h-8 text-terracotta-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">正在启动AR...</h3>
              <p className="text-warmgray-400">请允许相机访问权限</p>
            </motion.div>
          ) : (
            // Idle view - start button
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-terracotta-500 to-forest-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-terracotta-500/30">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AR预览</h3>
              <p className="text-warmgray-400 mb-8 max-w-sm">
                在您的真实空间中查看 {furnitureName} 的摆放效果
              </p>
              
              <button
                onClick={startARSession}
                className="btn-primary text-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                启动AR相机
              </button>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-warmgray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-forest-500" />
                  <span>WebXR支持</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-forest-500" />
                  <span>实时渲染</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

