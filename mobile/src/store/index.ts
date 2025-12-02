import { create } from 'zustand';

// 设计方案类型
interface DesignProposal {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  furniture: FurnitureItem[];
  totalCost: number;
}

interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  links: {
    platform: string;
    url: string;
    price: number;
  }[];
}

interface AnalysisResult {
  id: string;
  imageUri: string;
  roomType: string;
  estimatedSize: string;
  currentStyle: string;
  furniture: string[];
  issues: string[];
}

// 设计状态
interface DesignState {
  // 当前分析结果
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  
  // 用户偏好
  preferences: {
    style: string;
    budget: [number, number];
    colors: string[];
    specialNeeds: string;
    furnitureSuggestions: string;
  };
  setPreferences: (preferences: Partial<DesignState['preferences']>) => void;
  
  // 设计方案
  proposals: DesignProposal[];
  setProposals: (proposals: DesignProposal[]) => void;
  currentProposal: DesignProposal | null;
  setCurrentProposal: (proposal: DesignProposal | null) => void;
  
  // 加载状态
  isAnalyzing: boolean;
  setIsAnalyzing: (loading: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  
  // 历史记录
  savedDesigns: DesignProposal[];
  addSavedDesign: (design: DesignProposal) => void;
  removeSavedDesign: (id: string) => void;
  
  // 重置
  reset: () => void;
}

const initialPreferences = {
  style: 'modern',
  budget: [1000, 5000] as [number, number],
  colors: [],
  specialNeeds: '',
  furnitureSuggestions: '',
};

export const useDesignStore = create<DesignState>((set) => ({
  // 分析结果
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  // 偏好
  preferences: initialPreferences,
  setPreferences: (newPrefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPrefs },
    })),
  
  // 设计方案
  proposals: [],
  setProposals: (proposals) => set({ proposals }),
  currentProposal: null,
  setCurrentProposal: (proposal) => set({ currentProposal: proposal }),
  
  // 加载状态
  isAnalyzing: false,
  setIsAnalyzing: (loading) => set({ isAnalyzing: loading }),
  isGenerating: false,
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  progress: 0,
  setProgress: (progress) => set({ progress }),
  
  // 历史记录
  savedDesigns: [],
  addSavedDesign: (design) =>
    set((state) => ({
      savedDesigns: [design, ...state.savedDesigns],
    })),
  removeSavedDesign: (id) =>
    set((state) => ({
      savedDesigns: state.savedDesigns.filter((d) => d.id !== id),
    })),
  
  // 重置
  reset: () =>
    set({
      currentAnalysis: null,
      preferences: initialPreferences,
      proposals: [],
      currentProposal: null,
      isAnalyzing: false,
      isGenerating: false,
      progress: 0,
    }),
}));

