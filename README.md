# SmartRoom-AI

AI-Powered Interior Design Assistant - Upload a room photo, select a style, get professional design proposals in seconds.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Overview

SmartRoom-AI is an intelligent interior design assistant powered by artificial intelligence. Users simply upload a room photo, select their preferred style, and the AI automatically analyzes room features and generates multiple professional design proposals with matching furniture recommendations.

## Implemented Features

### User System
- [x] User registration & login
- [x] JWT authentication
- [x] Protected routes (design features require login)
- [x] Persistent user sessions

### 📸 Room Analysis
- [x] Image upload with preview
- [x] **Custom room description** - Users can describe room characteristics for more accurate AI analysis
- [x] Claude AI smart analysis of room type, dimensions, existing furniture
- [x] Visual display of analysis results

### 🎨 Style Selection
- [x] 8 design styles: Modern, Nordic, Japanese Zen, Industrial, and more
- [x] Style preview images and descriptions
- [x] Sub-style variants (e.g., Nordic Sunshine, Nordic Forest)

### 💰 Preference Settings
- [x] Budget range selection
- [x] Color preference selection
- [x] Keep existing furniture option
- [x] **Furniture suggestions input** - Users can specify desired furniture/brands, AI strictly follows
- [x] Special requirements (workspace, gaming area, reading nook, etc.)

### 🖼️ AI Image Generation
- [x] **Auto Chinese-to-English translation** - Chinese requirements auto-translated to English prompts
- [x] FLUX Pro / DALL-E 3 high-quality image generation
- [x] Multiple proposals (3 different design schemes)
- [x] Real-time progress display
- [x] Auto-retry on generation failure

### 🛒 Smart Product Recommendations
- [x] **Claude AI product search** - Intelligent furniture and electronics recommendations
- [x] Brand recognition (ASUS, MSI, Apple, IKEA, etc.)
- [x] **Multi-platform purchase links**:
  - 🇨🇦 Amazon Canada, Best Buy, IKEA, Wayfair, Structube
  - 🇺🇸 Amazon US, Best Buy, IKEA, Wayfair, Target
  - 🇨🇳 Taobao, Tmall, JD.com, IKEA China
- [x] Realistic price estimates (CAD/USD/CNY)
- [x] Automatic total cost calculation

### 🎮 3D Preview
- [x] Three.js 3D room visualization
- [x] Drag to rotate, scroll to zoom, right-click to pan
- [x] Fullscreen immersive preview

### 📤 Export & Share
- [x] Download design images (PNG)
- [x] Generate share links
- [x] Social media sharing (Twitter, Facebook, WeChat)
- [x] Save to history

### 📚 History
- [x] Save design proposals locally
- [x] History page to view all saved designs
- [x] Preview, download, delete historical designs

### 🌐 Multilingual Support
- [x] Chinese/English toggle
- [x] Global language settings
- [x] Internationalized UI text

### 📱 Responsive Design
- [x] Desktop optimized
- [x] Tablet optimized
- [x] Mobile optimized
- [x] Touch-friendly interactions

### ⚡ UX Optimizations
- [x] Skeleton loading screens
- [x] Progress bar animations
- [x] Toast notifications
- [x] Smooth page transitions

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first CSS |
| Framer Motion | Animations |
| Three.js | 3D visualization |
| Zustand | State management |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance Python API |
| Claude AI | Room analysis, product recommendations, translation |
| FLUX / DALL-E | AI image generation |
| Replicate | ML model hosting |
| Pydantic | Data validation |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- API Keys: Anthropic (Claude), Replicate

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/C0k11/SmartRoom-AI.git
cd SmartRoom-AI
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Configure environment variables**

Copy `backend/env.example` to `backend/.env` and fill in your API keys:
```env
ANTHROPIC_API_KEY=your_claude_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

5. **Start the services**

Frontend (Terminal 1):
```bash
cd frontend
npm run dev
```

Backend (Terminal 2):
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

6. **Open** http://localhost:3000

## 📁 Project Structure

```
SmartRoom-AI/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Page routes
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── design/      # Design page
│   │   │   ├── login/       # Login page
│   │   │   └── history/     # History page
│   │   ├── components/      # React components
│   │   │   ├── design/      # Design-related components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # Common UI components
│   │   ├── lib/             # Utilities
│   │   │   ├── api.ts       # API client
│   │   │   ├── auth.tsx     # Auth context
│   │   │   └── i18n.tsx     # Internationalization
│   │   └── store/           # Zustand state
│   └── package.json
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   │   └── endpoints/
│   │   │       ├── analysis.py   # Room analysis
│   │   │       └── design.py     # Design generation
│   │   ├── services/        # Business logic
│   │   │   ├── vision_service.py        # Image analysis
│   │   │   ├── design_service.py        # Design concepts
│   │   │   ├── image_generation_service.py  # Image generation
│   │   │   └── furniture_matching_service.py # Product recommendations
│   │   └── core/            # Configuration
│   └── requirements.txt
└── README.md
```

## 🎯 User Flow

1. **Register/Login** - Create an account or sign in
2. **Upload Photo** - Take or upload a room photo
3. **Describe Room** - Optionally describe room characteristics
4. **Select Style** - Choose your preferred design style
5. **Set Preferences** - Budget, colors, special requirements
6. **Add Suggestions** - Specify desired furniture/brands
7. **Generate Designs** - AI generates multiple design proposals
8. **View Results** - 3D preview, download, share

## 📸 Screenshots

(Coming soon)

## 🔮 Future Plans

- [ ] Integrate more image generation models (Midjourney API)
- [ ] Real product API integration (live pricing)
- [ ] Cloud sync for user accounts
- [ ] AR augmented reality preview
- [ ] Multi-room project management
- [ ] Designer collaboration features

## 📄 License

MIT License

## 👤 Author

**Cok11**

---

Made with ❤️ by Cok11
