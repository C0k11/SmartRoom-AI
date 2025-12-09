import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Base URL - 根据平台和环境选择
// Android模拟器用 10.0.2.2 访问宿主机
// iOS模拟器用 localhost
// 真机需要使用实际IP地址
const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api/v1';
    } else {
      return 'http://localhost:8000/api/v1';
    }
  }
  // 生产环境URL
  return 'https://your-production-api.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120秒超时 (AI生成需要更长时间)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - 添加认证token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期,清除登录状态
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// 分析 API
export const analysisApi = {
  // 上传图片进行分析
  uploadImage: async (imageUri: string, language: string = 'zh', description?: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'room.jpg',
    } as any);
    
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post(`/analysis/upload?language=${language}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 获取分析状态
  getStatus: async (analysisId: string) => {
    const response = await apiClient.get(`/analysis/status/${analysisId}`);
    return response.data;
  },

  // 获取demo分析
  getDemo: async () => {
    const response = await apiClient.get('/analysis/demo');
    return response.data;
  },
};

// 设计 API
export const designApi = {
  // 生成设计方案
  generate: async (analysisId: string, preferences: any, language: string = 'zh') => {
    const response = await apiClient.post('/design/generate', {
      analysis_id: analysisId,
      preferences: {
        style: preferences.style || 'modern',
        budget: preferences.budget?.[1] || 10000,
        budget_range: preferences.budget || preferences.budgetRange || [1000, 10000],
        keep_furniture: preferences.keepFurniture || [],
        requirements: preferences.requirements || [],
        color_preference: preferences.colors || preferences.colorPreference || [],
        special_needs: preferences.specialNeeds || '',
        furniture_suggestions: preferences.furnitureSuggestions || '',
      },
      language,
    });
    return response.data;
  },

  // 获取设计状态
  getStatus: async (designId: string) => {
    const response = await apiClient.get(`/design/status/${designId}`);
    return response.data;
  },

  // 获取demo设计
  getDemo: async () => {
    const response = await apiClient.get('/design/demo');
    return response.data;
  },

  // 保存设计
  save: async (designId: string) => {
    const response = await apiClient.post(`/design/save/${designId}`);
    return response.data;
  },

  // 获取分享链接
  getShareLink: async (designId: string) => {
    const response = await apiClient.get(`/design/share/${designId}`);
    return response.data;
  },
};

// 用户 API
export const userApi = {
  // 登录
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/users/login', { email, password });
    if (response.data.access_token) {
      await AsyncStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  },

  // 注册
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post('/users/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // 获取用户信息
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // 获取用户信息 (兼容旧API)
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // 更新用户资料
  updateProfile: async (profile: { name?: string; avatar?: string }) => {
    const response = await apiClient.put('/users/me', profile);
    return response.data;
  },

  // 获取用户的设计历史
  getDesigns: async () => {
    const response = await apiClient.get('/users/me/designs');
    return response.data;
  },

  // 保存设计到历史
  saveDesign: async (design: {
    name: string;
    description?: string;
    image_url: string;
    original_image?: string;
    style: string;
    total_cost: number;
    furniture_items?: any[];
  }) => {
    const response = await apiClient.post('/users/me/designs', design);
    return response.data;
  },

  // 删除保存的设计
  deleteDesign: async (designId: string) => {
    const response = await apiClient.delete(`/users/me/designs/${designId}`);
    return response.data;
  },

  // 登出
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
  },
};

// 家具 API
export const furnitureApi = {
  // 搜索家具
  search: async (params: {
    query?: string;
    category?: string;
    style?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await apiClient.get('/furniture/search', { params });
    return response.data;
  },

  // 获取家具分类
  getCategories: async () => {
    const response = await apiClient.get('/furniture/categories');
    return response.data;
  },

  // 获取家具风格
  getStyles: async () => {
    const response = await apiClient.get('/furniture/styles');
    return response.data;
  },

  // 获取家具品牌
  getBrands: async () => {
    const response = await apiClient.get('/furniture/brands');
    return response.data;
  },

  // 获取家具详情
  getDetail: async (id: string) => {
    const response = await apiClient.get(`/furniture/${id}`);
    return response.data;
  },

  // 家具匹配
  match: async (style: string, roomType: string, budget: number, existingFurniture?: string[]) => {
    const response = await apiClient.post('/furniture/match', {
      style,
      room_type: roomType,
      budget,
      existing_furniture: existingFurniture,
    });
    return response.data;
  },
};

// 项目/历史 API
export const projectApi = {
  // 获取用户的设计历史
  getHistory: async () => {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  // 获取单个项目详情
  getProject: async (projectId: string) => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  // 创建项目
  create: async (name: string, roomType: string, description?: string) => {
    const response = await apiClient.post('/projects', { name, room_type: roomType, description });
    return response.data;
  },

  // 更新项目
  update: async (id: string, updates: any) => {
    const response = await apiClient.put(`/projects/${id}`, updates);
    return response.data;
  },

  // 删除项目
  deleteProject: async (projectId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  },
};

export default apiClient;

