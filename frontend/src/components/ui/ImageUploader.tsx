'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Camera,
  Check,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n'

interface ImageUploaderProps {
  onImageUpload: (file: File, preview: string) => void
  isUploading?: boolean
  uploadedImage?: string | null
  onRemove?: () => void
}

export function ImageUploader({ 
  onImageUpload, 
  isUploading = false,
  uploadedImage = null,
  onRemove 
}: ImageUploaderProps) {
  const { language } = useLanguage()
  const [preview, setPreview] = useState<string | null>(uploadedImage)

  const texts = {
    zh: {
      analyzing: '正在分析图片...',
      uploaded: '已上传',
      removeHint: '点击右上角删除后可重新上传',
      dropHere: '松开鼠标上传图片',
      uploadPhoto: '上传您的房间照片',
      dragOrClick: '拖放图片到这里，或点击选择文件',
      selectImage: '选择图片',
      formats: '支持 JPG, PNG, WebP 格式，最大 10MB',
    },
    en: {
      analyzing: 'Analyzing image...',
      uploaded: 'Uploaded',
      removeHint: 'Click top-right to remove and re-upload',
      dropHere: 'Drop to upload',
      uploadPhoto: 'Upload your room photo',
      dragOrClick: 'Drag and drop here, or click to select',
      selectImage: 'Select Image',
      formats: 'Supports JPG, PNG, WebP, max 10MB',
    }
  }
  const txt = texts[language]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreview(result)
        onImageUpload(file, result)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onRemove?.()
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-room rounded-2xl overflow-hidden bg-warmgray-100 group"
          >
            <Image
              src={preview}
              alt="Room photo"
              fill
              className="object-cover"
            />
            
            {/* Overlay with status */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {isUploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-terracotta-500 animate-spin" />
                  <p className="text-warmgray-700 font-medium">{txt.analyzing}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Success indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-forest-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  {txt.uploaded}
                </div>
                
                {/* Remove button */}
                <button
                  onClick={handleRemove}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-sm">{txt.removeHint}</span>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative aspect-room rounded-2xl border-2 border-dashed cursor-pointer
                transition-all duration-300 overflow-hidden
                ${isDragActive 
                  ? 'border-terracotta-500 bg-terracotta-50' 
                  : 'border-warmgray-300 hover:border-terracotta-400 hover:bg-warmgray-50'
                }
              `}
            >
              <input {...getInputProps()} />
            
            {/* Background pattern */}
            <div className="absolute inset-0 bg-hero-pattern opacity-30" />
            
            <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className={`
                  w-20 h-20 rounded-2xl mb-6 flex items-center justify-center
                  ${isDragActive 
                    ? 'bg-terracotta-100' 
                    : 'bg-warmgray-100'
                  }
                `}
              >
                {isDragActive ? (
                  <Upload className="w-10 h-10 text-terracotta-500" />
                ) : (
                  <Camera className="w-10 h-10 text-warmgray-400" />
                )}
              </motion.div>
              
              <h3 className="text-xl font-semibold text-warmgray-800 mb-2">
                {isDragActive ? txt.dropHere : txt.uploadPhoto}
              </h3>
              <p className="text-warmgray-500 mb-6">
                {txt.dragOrClick}
              </p>
              
              <div className="flex items-center gap-4">
                <button className="btn-primary py-2.5">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {txt.selectImage}
                </button>
              </div>
              
              <p className="text-sm text-warmgray-400 mt-6">
                {txt.formats}
              </p>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

