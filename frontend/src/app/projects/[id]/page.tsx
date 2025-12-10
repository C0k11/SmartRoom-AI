'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  FileEdit,
  Home,
  Bed,
  UtensilsCrossed,
  Bath,
  Briefcase,
  Sofa,
  Edit2,
  Save,
  X,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth'
import { projectsApi, userApi } from '@/lib/api'
import { formatCAD, useLanguage } from '@/lib/i18n'
import toast from 'react-hot-toast'

interface Design {
  id: string
  name: string
  description: string | null
  image_url: string
  original_image: string | null
  style: string
  total_cost: number
  furniture_items: any[]
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string | null
  room_type: string
  thumbnail: string | null
  status: string
  original_image: string | null
  analysis: any | null
  designs: Design[]
  selected_design_id: string | null
  preferences: any | null
  created_at: string
  updated_at: string
  designs_count: number
}

const roomTypeIcons: Record<string, any> = {
  living: Sofa,
  bedroom: Bed,
  kitchen: UtensilsCrossed,
  bathroom: Bath,
  office: Briefcase,
  dining: UtensilsCrossed,
  other: Home,
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
}

export default function ProjectDetailPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const texts = {
    zh: {
      loginFirst: '请先登录',
      goLogin: '去登录',
      backProjects: '返回项目列表',
      notFound: '项目不存在',
      loading: '加载中...',
      startDesign: '开始设计',
      newDesign: '新设计',
      designs: '设计方案',
      noDesigns: '暂无设计',
      noDesignsDesc: '上传房间照片，开始生成AI设计方案',
      selectAsMain: '设为主方案',
      selected: '当前主方案',
      view: '查看',
      delete: '删除',
      confirmDelete: '确定要删除此设计吗？',
      deleted: '设计已删除',
      downloadSuccess: '下载成功',
      downloadFailed: '下载失败',
      projectInfo: '项目信息',
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      updated: '已更新',
      roomType: '房间类型',
      status: '状态',
      createdAt: '创建时间',
      updatedAt: '更新时间',
      living: '客厅',
      bedroom: '卧室',
      kitchen: '厨房',
      bathroom: '卫生间',
      office: '办公室',
      dining: '餐厅',
      other: '其他',
      draft: '草稿',
      in_progress: '进行中',
      completed: '已完成',
    },
    en: {
      loginFirst: 'Please Login',
      goLogin: 'Login',
      backProjects: 'Back to Projects',
      notFound: 'Project not found',
      loading: 'Loading...',
      startDesign: 'Start Design',
      newDesign: 'New Design',
      designs: 'Design Proposals',
      noDesigns: 'No Designs Yet',
      noDesignsDesc: 'Upload a room photo to start generating AI design proposals',
      selectAsMain: 'Set as Main',
      selected: 'Main Design',
      view: 'View',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this design?',
      deleted: 'Design deleted',
      downloadSuccess: 'Download successful',
      downloadFailed: 'Download failed',
      projectInfo: 'Project Info',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      updated: 'Updated',
      roomType: 'Room Type',
      status: 'Status',
      createdAt: 'Created',
      updatedAt: 'Updated',
      living: 'Living Room',
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      office: 'Office',
      dining: 'Dining Room',
      other: 'Other',
      draft: 'Draft',
      in_progress: 'In Progress',
      completed: 'Completed',
    }
  }
  const txt = texts[language]

  useEffect(() => {
    const loadProject = async () => {
      if (!isAuthenticated || !projectId) return
      
      try {
        const data = await projectsApi.get(projectId)
        setProject(data)
        setEditForm({ name: data.name, description: data.description || '' })
      } catch (error: any) {
        console.error('Failed to load project:', error)
        if (error.response?.status === 404) {
          toast.error(txt.notFound)
          router.push('/projects')
        }
      } finally {
        setLoadingProject(false)
      }
    }
    
    if (!isLoading) {
      loadProject()
    }
  }, [isAuthenticated, isLoading, projectId])

  const handleSaveEdit = async () => {
    if (!project || !editForm.name.trim()) return
    
    setSaving(true)
    try {
      await projectsApi.update(project.id, {
        name: editForm.name,
        description: editForm.description || undefined,
      })
      setProject({ ...project, name: editForm.name, description: editForm.description })
      setEditing(false)
      toast.success(txt.updated)
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleSelectDesign = async (designId: string) => {
    if (!project) return
    
    try {
      await projectsApi.selectDesign(project.id, designId)
      setProject({ ...project, selected_design_id: designId, status: 'completed' })
      toast.success(txt.updated)
    } catch (error) {
      console.error('Failed to select design:', error)
    }
  }

  const handleDeleteDesign = async (designId: string) => {
    if (!project || !confirm(txt.confirmDelete)) return
    
    try {
      await userApi.deleteDesign(designId)
      setProject({
        ...project,
        designs: project.designs.filter(d => d.id !== designId),
        designs_count: project.designs_count - 1,
        selected_design_id: project.selected_design_id === designId ? null : project.selected_design_id,
      })
      toast.success(txt.deleted)
    } catch (error) {
      console.error('Failed to delete design:', error)
      toast.error('Failed to delete')
    }
  }

  const downloadImage = async (design: Design) => {
    try {
      const response = await fetch(design.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${design.name}-${new Date(design.created_at).toLocaleDateString()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(txt.downloadSuccess)
    } catch (err) {
      toast.error(txt.downloadFailed)
    }
  }

  const getRoomTypeLabel = (type: string) => {
    const key = type as keyof typeof txt
    return txt[key] || type
  }

  const getStatusLabel = (status: string) => {
    const key = status as keyof typeof txt
    return txt[key] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileEdit
      case 'in_progress': return Clock
      case 'completed': return CheckCircle
      default: return Clock
    }
  }

  if (isLoading || loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">{txt.loginFirst}</h1>
            <Link href="/login" className="btn-primary">
              {txt.goLogin}
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">{txt.notFound}</h1>
            <Link href="/projects" className="btn-primary">
              {txt.backProjects}
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const RoomIcon = roomTypeIcons[project.room_type] || Home
  const StatusIcon = getStatusIcon(project.status)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {txt.backProjects}
            </Link>
          </div>

          {/* Project Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                  <RoomIcon className="w-8 h-8 text-blue-600" />
                </div>
                
                {editing ? (
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder={language === 'zh' ? '项目描述...' : 'Project description...'}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        {txt.save}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setEditForm({ name: project.name, description: project.description || '' })
                        }}
                        className="px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                      >
                        {txt.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                      <button
                        onClick={() => setEditing(true)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    {project.description && (
                      <p className="text-slate-600 mt-1">{project.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <RoomIcon className="w-4 h-4" />
                        {getRoomTypeLabel(project.room_type)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[project.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <Link
                href={`/design?project=${project.id}`}
                className="btn-primary flex items-center gap-2 shrink-0"
              >
                <Sparkles className="w-5 h-5" />
                {project.designs.length > 0 ? txt.newDesign : txt.startDesign}
              </Link>
            </div>
          </div>

          {/* Designs Section */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              {txt.designs}
              <span className="text-base font-normal text-slate-500">({project.designs.length})</span>
            </h2>
          </div>

          {project.designs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">{txt.noDesigns}</h3>
              <p className="text-slate-500 mb-6">{txt.noDesignsDesc}</p>
              <Link
                href={`/design?project=${project.id}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {txt.startDesign}
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.designs.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all ${
                    project.selected_design_id === design.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-slate-100'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-video relative group">
                    <img
                      src={design.image_url}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {project.selected_design_id === design.id && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {txt.selected}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedDesign(design)}
                        className="p-3 bg-white rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => downloadImage(design)}
                        className="p-3 bg-white rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Download className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-slate-900">{design.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{design.style}</p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(design.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                        <DollarSign className="w-4 h-4" />
                        {formatCAD(design.total_cost)}
                      </div>
                    </div>
                    
                    {project.selected_design_id !== design.id && (
                      <button
                        onClick={() => handleSelectDesign(design.id)}
                        className="w-full mt-3 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        {txt.selectAsMain}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {selectedDesign && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedDesign(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDesign(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <img
              src={selectedDesign.image_url}
              alt={selectedDesign.name}
              className="w-full rounded-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-white">{selectedDesign.name}</h3>
              <p className="text-white/70 mt-2">{selectedDesign.style} | {formatCAD(selectedDesign.total_cost)}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
