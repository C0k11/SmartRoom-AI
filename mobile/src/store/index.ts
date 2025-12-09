import { create } from 'zustand';

// 家具链接类型
export interface FurnitureLink {
  name: string;
  platform: string;
  url: string;
  icon?: string;
  price?: number;
}

// 家具项目类型
export interface FurnitureItem {
  id: string;
  name: string;
  name_en?: string;
  category: string;
  price: number;
  currency: string;
  image?: string;
  imageUrl?: string;
  link?: string;  // Legacy single link
  links?: FurnitureLink[];  // Multiple platform links
  dimensions?: string;
  brand?: string;
}

// 设计方案类型
export interface DesignProposal {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  style: string;
  confidence: number;
  furniture: FurnitureItem[];
  totalCost: number;
  highlights: string[];
}

// 房间分析结果类型
export interface AnalysisResult {
  id: string;
  imageUri: string;
  roomType: string;
  estimatedSize: string;
  currentStyle: string;
  furniture: string[];
  existingFurniture: string[];
  issues: string[];
  lighting?: string;
  problems?: string[];
  potential?: string;
  dimensions?: {
    width: number;
    length: number;
    height: number;
  };
}

// 偏好设置类型
export interface Preferences {
  style: string;
  budget: [number, number];
  budgetRange?: [number, number];
  colors: string[];
  colorPreference?: string[];
  specialNeeds: string;
  furnitureSuggestions: string;
  keepFurniture?: string[];
  requirements?: string[];
  additionalNotes?: string;
  roomDescription?: string;
}

// 设计状态
interface DesignState {
  // 上传的图片
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  
  // 当前分析结果
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  
  // 用户偏好
  preferences: Preferences;
  setPreferences: (preferences: Partial<Preferences>) => void;
  updatePreferences: (key: keyof Preferences, value: any) => void;
  
  // 设计方案
  proposals: DesignProposal[];
  setProposals: (proposals: DesignProposal[]) => void;
  selectedDesign: DesignProposal | null;
  setSelectedDesign: (design: DesignProposal | null) => void;
  currentProposal: DesignProposal | null;
  setCurrentProposal: (proposal: DesignProposal | null) => void;
  
  // 加载状态
  isAnalyzing: boolean;
  setIsAnalyzing: (loading: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // 历史记录
  savedDesigns: DesignProposal[];
  addSavedDesign: (design: DesignProposal) => void;
  removeSavedDesign: (id: string) => void;
  
  // 收藏
  favorites: string[];
  toggleFavorite: (id: string) => void;
  
  // 重置
  reset: () => void;
}

const initialPreferences: Preferences = {
  style: 'modern',
  budget: [1000, 5000],
  budgetRange: [1000, 10000],
  colors: [],
  colorPreference: [],
  specialNeeds: '',
  furnitureSuggestions: '',
  keepFurniture: [],
  requirements: [],
  additionalNotes: '',
  roomDescription: '',
};

export const useDesignStore = create<DesignState>((set) => ({
  // 上传的图片
  uploadedImage: null,
  setUploadedImage: (image) => set({ uploadedImage: image }),
  
  // 分析结果
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  // 偏好
  preferences: initialPreferences,
  setPreferences: (newPrefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPrefs },
    })),
  updatePreferences: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    })),
  
  // 设计方案
  proposals: [],
  setProposals: (proposals) => set({ proposals }),
  selectedDesign: null,
  setSelectedDesign: (design) => set({ selectedDesign: design }),
  currentProposal: null,
  setCurrentProposal: (proposal) => set({ currentProposal: proposal }),
  
  // 加载状态
  isAnalyzing: false,
  setIsAnalyzing: (loading) => set({ isAnalyzing: loading }),
  isGenerating: false,
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  progress: 0,
  setProgress: (progress) => set({ progress }),
  statusMessage: '',
  setStatusMessage: (message) => set({ statusMessage: message }),
  error: null,
  setError: (error) => set({ error }),
  
  // 历史记录
  savedDesigns: [],
  addSavedDesign: (design) =>
    set((state) => ({
      savedDesigns: [design, ...state.savedDesigns.filter(d => d.id !== design.id)].slice(0, 20),
    })),
  removeSavedDesign: (id) =>
    set((state) => ({
      savedDesigns: state.savedDesigns.filter((d) => d.id !== id),
    })),
  
  // 收藏
  favorites: [],
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter(f => f !== id)
        : [...state.favorites, id],
    })),
  
  // 重置
  reset: () =>
    set({
      uploadedImage: null,
      currentAnalysis: null,
      preferences: initialPreferences,
      proposals: [],
      selectedDesign: null,
      currentProposal: null,
      isAnalyzing: false,
      isGenerating: false,
      progress: 0,
      statusMessage: '',
      error: null,
    }),
}));

