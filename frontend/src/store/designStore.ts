import { create } from 'zustand'

export interface RoomAnalysis {
  roomType: string
  dimensions: {
    width: number
    length: number
    height: number
  }
  existingFurniture: string[]
  currentStyle: string
  lighting: string
  problems: string[]
  potential: string
  confidence: number
}

export interface DesignStyle {
  id: string
  name: string
  nameEn: string
  description: string
  image: string
  colors: string[]
}

export interface Preferences {
  budget: number | null
  budgetRange: [number, number]
  keepFurniture: string[]
  requirements: string[]
  colorPreference: string[]
  specialNeeds: string
  roomDescription: string  // User's custom room description
  additionalNotes: string  // Other notes
}

export interface FurnitureLink {
  name: string
  url: string
  icon: string
}

export interface FurnitureItem {
  id: string
  name: string
  name_en?: string
  category: string
  price: number
  image: string
  link?: string  // Legacy single link
  links?: FurnitureLink[]  // Multiple platform links
  dimensions: string
  brand: string
}

export interface DesignProposal {
  id: string
  name: string
  description: string
  image: string
  style: string
  confidence: number
  furniture: FurnitureItem[]
  totalCost: number
  highlights: string[]
}

interface DesignState {
  // Step 1: Upload
  uploadedImage: string | null
  setUploadedImage: (image: string | null) => void
  isAnalyzing: boolean
  setIsAnalyzing: (loading: boolean) => void
  analysis: RoomAnalysis | null
  setAnalysis: (analysis: RoomAnalysis | null) => void

  // Step 2: Style
  selectedStyle: DesignStyle | null
  setSelectedStyle: (style: DesignStyle | null) => void

  // Step 3: Preferences
  preferences: Preferences
  setPreferences: (preferences: Partial<Preferences>) => void
  updatePreferences: (key: keyof Preferences, value: any) => void

  // Step 4: Results
  isGenerating: boolean
  setIsGenerating: (loading: boolean) => void
  designs: DesignProposal[]
  setDesigns: (designs: DesignProposal[]) => void
  selectedDesign: DesignProposal | null
  setSelectedDesign: (design: DesignProposal | null) => void

  // Actions
  reset: () => void
}

const defaultPreferences: Preferences = {
  budget: null,
  budgetRange: [1000, 10000],
  keepFurniture: [],
  requirements: [],
  colorPreference: [],
  specialNeeds: '',
  roomDescription: '',
  additionalNotes: '',
}

export const useDesignStore = create<DesignState>((set) => ({
  // Step 1
  uploadedImage: null,
  setUploadedImage: (image) => set({ uploadedImage: image }),
  isAnalyzing: false,
  setIsAnalyzing: (loading) => set({ isAnalyzing: loading }),
  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),

  // Step 2
  selectedStyle: null,
  setSelectedStyle: (style) => set({ selectedStyle: style }),

  // Step 3
  preferences: defaultPreferences,
  setPreferences: (preferences) => 
    set((state) => ({ 
      preferences: { ...state.preferences, ...preferences } 
    })),
  updatePreferences: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value }
    })),

  // Step 4
  isGenerating: false,
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  designs: [],
  setDesigns: (designs) => set({ designs }),
  selectedDesign: null,
  setSelectedDesign: (design) => set({ selectedDesign: design }),

  // Actions
  reset: () => set({
    uploadedImage: null,
    isAnalyzing: false,
    analysis: null,
    selectedStyle: null,
    preferences: defaultPreferences,
    isGenerating: false,
    designs: [],
    selectedDesign: null,
  }),
}))

