'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Folder, 
  Image, 
  Clock, 
  Trash2, 
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  Star,
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { formatRelativeTime, formatCurrency } from '@/lib/utils'

// Mock projects data
const mockProjects = [
  {
    id: 'p1',
    name: '客厅改造计划',
    roomType: 'living',
    status: 'completed',
    thumbnail: null,
    colors: ['#FEFEFE', '#E8DED1', '#6B8E6B'],
    designsCount: 3,
    selectedDesign: '北欧阳光',
    totalCost: 8500,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-20T15:45:00',
  },
  {
    id: 'p2',
    name: '主卧室温馨风',
    roomType: 'bedroom',
    status: 'in_progress',
    thumbnail: null,
    colors: ['#F5F1EB', '#C9B896', '#8B9A6B'],
    designsCount: 2,
    selectedDesign: null,
    totalCost: 0,
    createdAt: '2024-01-18T09:00:00',
    updatedAt: '2024-01-18T09:00:00',
  },
  {
    id: 'p3',
    name: '书房工作区',
    roomType: 'office',
    status: 'draft',
    thumbnail: null,
    colors: ['#FFFFFF', '#1A1A1A', '#8B7355'],
    designsCount: 0,
    selectedDesign: null,
    totalCost: 0,
    createdAt: '2024-01-19T14:20:00',
    updatedAt: '2024-01-19T14:20:00',
  },
]

const roomTypeLabels: Record<string, string> = {
  living: '客厅',
  bedroom: '卧室',
  kitchen: '厨房',
  bathroom: '卫生间',
  office: '书房',
}

const statusLabels: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'warmgray' },
  in_progress: { text: '进行中', color: 'ocean' },
  completed: { text: '已完成', color: 'forest' },
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-warmgray-50">
      <Header />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">我的项目</h1>
              <p className="text-warmgray-600">管理您的所有设计项目</p>
            </div>
            <Link href="/design" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新建项目
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '总项目', value: mockProjects.length, icon: Folder },
              { label: '已完成', value: mockProjects.filter(p => p.status === 'completed').length, icon: Star },
              { label: '设计方案', value: mockProjects.reduce((sum, p) => sum + p.designsCount, 0), icon: Image },
              { label: '总预算', value: formatCurrency(mockProjects.reduce((sum, p) => sum + p.totalCost, 0)), icon: Clock },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta-100 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="text-sm text-warmgray-500">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warmgray-400" />
              <input
                type="text"
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-primary pl-10"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-warmgray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-primary w-auto"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            {/* View mode */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-terracotta-100 text-terracotta-600' : 'text-warmgray-400 hover:text-warmgray-600'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-terracotta-100 text-terracotta-600' : 'text-warmgray-400 hover:text-warmgray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Projects */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-warmgray-100 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-warmgray-400" />
              </div>
              <h3 className="text-xl font-semibold text-warmgray-700 mb-2">
                没有找到项目
              </h3>
              <p className="text-warmgray-500 mb-6">
                创建您的第一个设计项目
              </p>
              <Link href="/design" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                新建项目
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div 
                    className="h-40 relative"
                    style={{
                      background: `linear-gradient(135deg, ${project.colors[0]} 0%, ${project.colors[1]} 50%, ${project.colors[2]} 100%)`,
                    }}
                  >
                    {/* Status badge */}
                    <span className={`absolute top-3 left-3 px-2 py-1 bg-${statusLabels[project.status].color}-100 text-${statusLabels[project.status].color}-700 text-xs font-medium rounded-full`}>
                      {statusLabels[project.status].text}
                    </span>
                    
                    {/* Menu */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                        className="p-2 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-warmgray-600" />
                      </button>
                      
                      {activeMenu === project.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-warmgray-100 py-1 z-10">
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-warmgray-50 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            查看
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-warmgray-50 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            编辑
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-warmgray-50 flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            复制
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-warmgray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-warmgray-500 mb-3">
                      {roomTypeLabels[project.roomType]} · {project.designsCount} 个方案
                    </p>
                    
                    {project.selectedDesign && (
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-warmgray-500">选中方案</span>
                        <span className="font-medium text-terracotta-600">{project.selectedDesign}</span>
                      </div>
                    )}
                    
                    {project.totalCost > 0 && (
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-warmgray-500">预算</span>
                        <span className="font-bold">{formatCurrency(project.totalCost)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-warmgray-400 pt-3 border-t border-warmgray-100">
                      <span>更新于 {formatRelativeTime(project.updatedAt)}</span>
                      <Link 
                        href={`/project/${project.id}`}
                        className="text-terracotta-600 font-medium hover:text-terracotta-700"
                      >
                        查看详情 →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-warmgray-50 border-b border-warmgray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-warmgray-500">项目</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-warmgray-500">房间</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-warmgray-500">状态</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-warmgray-500">方案数</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-warmgray-500">更新时间</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-warmgray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-warmgray-100 hover:bg-warmgray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, ${project.colors[0]}, ${project.colors[1]})`,
                            }}
                          />
                          <span className="font-medium">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-warmgray-600">{roomTypeLabels[project.roomType]}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 bg-${statusLabels[project.status].color}-100 text-${statusLabels[project.status].color}-700 text-xs font-medium rounded-full`}>
                          {statusLabels[project.status].text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-warmgray-600">{project.designsCount}</td>
                      <td className="px-6 py-4 text-warmgray-500 text-sm">{formatRelativeTime(project.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/project/${project.id}`} className="text-terracotta-600 hover:text-terracotta-700 font-medium text-sm">
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

