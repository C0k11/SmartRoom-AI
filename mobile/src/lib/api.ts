import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - 生产环境需要替换
// 安卓模拟器用 10.0.2.2 访问宿主机
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api/v1'  // 安卓模拟器访问宿主机
  : 'http://10.0.2.2:8000/api/v1'; // APK也用这个地址

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60秒超时 (图片处理需要更长时间)
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
  uploadImage: async (imageUri: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'room.jpg',
    } as any);
    
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/analysis/upload', formData, {
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
};

// 设计 API
export const designApi = {
  // 生成设计方案
  generate: async (analysisId: string, preferences: any) => {
    const response = await apiClient.post('/design/generate', {
      analysis_id: analysisId,
      preferences,
    });
    return response.data;
  },

  // 获取设计状态
  getStatus: async (designId: string) => {
    const response = await apiClient.get(`/design/status/${designId}`);
    return response.data;
  },

  // 保存设计
  save: async (designData: any) => {
    const response = await apiClient.post('/design/save', designData);
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
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // 登出
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
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

  // 删除项目
  deleteProject: async (projectId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  },
};

export default apiClient;

