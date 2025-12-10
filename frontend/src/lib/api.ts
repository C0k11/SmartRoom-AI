import axios from 'axios'

// Use relative path if no explicit API URL is set (will use Next.js rewrites)
// Otherwise use the explicit API URL (for external access or different server)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Analysis API
export const analysisApi = {
  uploadImage: async (file: File, language: string = 'zh') => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`/analysis/upload?language=${language}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  getStatus: async (jobId: string) => {
    const response = await api.get(`/analysis/status/${jobId}`)
    return response.data
  },
  
  getDemo: async () => {
    const response = await api.get('/analysis/demo')
    return response.data
  },
}

// Design API
export const designApi = {
  generate: async (analysisId: string, preferences: any, language: string = 'zh') => {
    const response = await api.post('/design/generate', {
      analysis_id: analysisId,
      preferences,
      language,
    })
    return response.data
  },
  
  getStatus: async (jobId: string) => {
    const response = await api.get(`/design/status/${jobId}`)
    return response.data
  },
  
  getDemo: async () => {
    const response = await api.get('/design/demo')
    return response.data
  },
  
  save: async (designId: string) => {
    const response = await api.post(`/design/save/${designId}`)
    return response.data
  },
  
  getShareLink: async (designId: string) => {
    const response = await api.get(`/design/share/${designId}`)
    return response.data
  },
}

// Furniture API
export const furnitureApi = {
  search: async (params: {
    query?: string
    category?: string
    style?: string
    minPrice?: number
    maxPrice?: number
    brand?: string
    page?: number
    pageSize?: number
  }) => {
    const response = await api.get('/furniture/search', { params })
    return response.data
  },
  
  getCategories: async () => {
    const response = await api.get('/furniture/categories')
    return response.data
  },
  
  getStyles: async () => {
    const response = await api.get('/furniture/styles')
    return response.data
  },
  
  getBrands: async () => {
    const response = await api.get('/furniture/brands')
    return response.data
  },
  
  getDetail: async (id: string) => {
    const response = await api.get(`/furniture/${id}`)
    return response.data
  },
  
  match: async (style: string, roomType: string, budget: number, existingFurniture?: string[]) => {
    const response = await api.post('/furniture/match', {
      style,
      room_type: roomType,
      budget,
      existing_furniture: existingFurniture,
    })
    return response.data
  },
  
  createShoppingList: async (designId: string, items: any[]) => {
    const response = await api.post('/furniture/shopping-list/create', {
      design_id: designId,
      items,
    })
    return response.data
  },
}

// User API
export const userApi = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/users/register', { email, password, name })
    return response.data
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password })
    return response.data
  },
  
  // Google OAuth login
  googleAuth: async (credential: string) => {
    const response = await api.post('/users/auth/google', { credential })
    return response.data
  },
  
  getMe: async () => {
    const response = await api.get('/users/me')
    return response.data
  },
  
  updateProfile: async (profile: { name?: string; avatar?: string }) => {
    const response = await api.put('/users/me', profile)
    return response.data
  },
  
  getDesigns: async () => {
    const response = await api.get('/users/me/designs')
    return response.data
  },
  
  // Save a design to history
  saveDesign: async (design: {
    name: string
    description?: string
    image_url: string
    original_image?: string
    style: string
    total_cost: number
    furniture_items?: any[]
  }) => {
    const response = await api.post('/users/me/designs', design)
    return response.data
  },
  
  // Delete a saved design
  deleteDesign: async (designId: string) => {
    const response = await api.delete(`/users/me/designs/${designId}`)
    return response.data
  },
}

// Projects API
export const projectsApi = {
  list: async () => {
    const response = await api.get('/projects')
    return response.data
  },
  
  create: async (name: string, roomType: string, description?: string) => {
    const response = await api.post('/projects', { name, room_type: roomType, description })
    return response.data
  },
  
  get: async (id: string) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },
  
  update: async (id: string, updates: {
    name?: string
    description?: string
    room_type?: string
    status?: string
    thumbnail?: string
    original_image?: string
    analysis?: any
    preferences?: any
  }) => {
    const response = await api.put(`/projects/${id}`, updates)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },
  
  selectDesign: async (projectId: string, designId: string) => {
    const response = await api.post(`/projects/${projectId}/designs/${designId}/select`)
    return response.data
  },
  
  duplicate: async (id: string) => {
    const response = await api.post(`/projects/${id}/duplicate`)
    return response.data
  },
  
  // Save a design to a project
  saveDesignToProject: async (projectId: string, design: {
    name: string
    description?: string
    image_url: string
    original_image?: string
    style: string
    total_cost: number
    furniture_items?: any[]
  }) => {
    const response = await api.post(`/projects/${projectId}/designs`, design)
    return response.data
  },
}

export default api

