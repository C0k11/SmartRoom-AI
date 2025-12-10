'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Eye, 
  Copy,
  ArrowLeft,
  Calendar,
  Home,
  Bed,
  UtensilsCrossed,
  Bath,
  Briefcase,
  Sofa,
  MoreVertical,
  X,
  Edit2,
  CheckCircle,
  Clock,
  FileEdit
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth'
import { projectsApi } from '@/lib/api'
import { useLanguage } from '@/lib/i18n'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  description: string | null
  room_type: string
  thumbnail: string | null
  status: string
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

export default function ProjectsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', room_type: 'living' })
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const texts = {
    zh: {
      loginFirst: '请先登录',
      goLogin: '去登录',
      backHome: '返回首页',
      title: '我的项目',
      subtitle: '管理您的多房间设计项目',
      newProject: '新建项目',
      noProjects: '暂无项目',
      noProjectsDesc: '创建一个新项目，开始您的房间设计之旅',
      createFirst: '创建第一个项目',
      designs: '个设计',
      view: '查看',
      duplicate: '复制',
      delete: '删除',
      confirmDelete: '确定要删除此项目吗？',
      deleted: '项目已删除',
      duplicated: '项目已复制',
      createProject: '创建新项目',
      projectName: '项目名称',
      projectNamePlaceholder: '例如：我的客厅改造',
      projectDesc: '项目描述（可选）',
      projectDescPlaceholder: '描述您的设计目标...',
      roomType: '房间类型',
      cancel: '取消',
      create: '创建',
      creating: '创建中...',
      created: '项目已创建',
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
      backHome: 'Back to Home',
      title: 'My Projects',
      subtitle: 'Manage your multi-room design projects',
      newProject: 'New Project',
      noProjects: 'No Projects',
      noProjectsDesc: 'Create a new project to start your room design journey',
      createFirst: 'Create First Project',
      designs: 'designs',
      view: 'View',
      duplicate: 'Duplicate',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this project?',
      deleted: 'Project deleted',
      duplicated: 'Project duplicated',
      createProject: 'Create New Project',
      projectName: 'Project Name',
      projectNamePlaceholder: 'e.g., My Living Room Makeover',
      projectDesc: 'Description (optional)',
      projectDescPlaceholder: 'Describe your design goals...',
      roomType: 'Room Type',
      cancel: 'Cancel',
      create: 'Create',
      creating: 'Creating...',
      created: 'Project created',
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

  const roomTypes = [
    { value: 'living', label: txt.living },
    { value: 'bedroom', label: txt.bedroom },
    { value: 'kitchen', label: txt.kitchen },
    { value: 'bathroom', label: txt.bathroom },
    { value: 'office', label: txt.office },
    { value: 'dining', label: txt.dining },
    { value: 'other', label: txt.other },
  ]

  useEffect(() => {
    const loadProjects = async () => {
      if (!isAuthenticated) return
      
      try {
        const data = await projectsApi.list()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoadingProjects(false)
      }
    }
    
    if (!isLoading) {
      loadProjects()
    }
  }, [isAuthenticated, isLoading])

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error(language === 'zh' ? '请输入项目名称' : 'Please enter project name')
      return
    }

    setCreating(true)
    try {
      const project = await projectsApi.create(
        newProject.name,
        newProject.room_type,
        newProject.description || undefined
      )
      setProjects([project, ...projects])
      setShowCreateModal(false)
      setNewProject({ name: '', description: '', room_type: 'living' })
      toast.success(txt.created)
      
      // Navigate to the new project
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm(txt.confirmDelete)) return

    try {
      await projectsApi.delete(id)
      setProjects(projects.filter(p => p.id !== id))
      toast.success(txt.deleted)
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project')
    }
    setMenuOpen(null)
  }

  const handleDuplicateProject = async (id: string) => {
    try {
      const result = await projectsApi.duplicate(id)
      // Reload projects list
      const data = await projectsApi.list()
      setProjects(data)
      toast.success(txt.duplicated)
    } catch (error) {
      console.error('Failed to duplicate project:', error)
      toast.error('Failed to duplicate project')
    }
    setMenuOpen(null)
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

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {txt.backHome}
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-blue-500" />
                {txt.title}
              </h1>
              <p className="text-slate-600 mt-2">
                {txt.subtitle}
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {txt.newProject}
            </button>
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-600 mb-2">{txt.noProjects}</h2>
              <p className="text-slate-500 mb-6">{txt.noProjectsDesc}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                {txt.createFirst}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => {
                const RoomIcon = roomTypeIcons[project.room_type] || Home
                const StatusIcon = getStatusIcon(project.status)
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video relative bg-gradient-to-br from-slate-100 to-slate-200">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RoomIcon className="w-16 h-16 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[project.status] || statusColors.draft}`}>
                        <StatusIcon className="w-3 h-3" />
                        {getStatusLabel(project.status)}
                      </div>
                      
                      {/* Menu Button */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setMenuOpen(menuOpen === project.id ? null : project.id)
                          }}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-600" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {menuOpen === project.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="w-4 h-4" />
                              {txt.view}
                            </Link>
                            <button
                              onClick={() => handleDuplicateProject(project.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full"
                            >
                              <Copy className="w-4 h-4" />
                              {txt.duplicate}
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                              {txt.delete}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Overlay on hover */}
                      <Link
                        href={`/projects/${project.id}`}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {txt.view}
                        </span>
                      </Link>
                    </div>
                    
                    {/* Info */}
                    <Link href={`/projects/${project.id}`} className="block p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 truncate">{project.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <RoomIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">{getRoomTypeLabel(project.room_type)}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-2xl font-bold text-blue-600">{project.designs_count}</span>
                          <span className="text-xs text-slate-500 block">{txt.designs}</span>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{project.description}</p>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.updated_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{txt.createProject}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {txt.projectName} *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder={txt.projectNamePlaceholder}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {txt.roomType}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {roomTypes.map((type) => {
                    const Icon = roomTypeIcons[type.value] || Home
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewProject({ ...newProject, room_type: type.value })}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          newProject.room_type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${newProject.room_type === type.value ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-xs ${newProject.room_type === type.value ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                          {type.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {txt.projectDesc}
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder={txt.projectDescPlaceholder}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {txt.cancel}
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creating || !newProject.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? txt.creating : txt.create}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Click outside to close menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  )
}
