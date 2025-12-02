import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'zh' | 'en';

const translations = {
  zh: {
    // 通用
    app_name: 'SmartRoom AI',
    loading: '加载中...',
    error: '出错了',
    retry: '重试',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    share: '分享',
    delete: '删除',
    
    // 首页
    home_title: '室内设计AI',
    home_capture: '拍摄房间',
    home_gallery: '从相册选择',
    home_favorites: '我的收藏',
    home_my_designs: '我的设计方案',
    home_explore: '探索灵感',
    
    // 相机
    camera_hint: '尽量包含整个房间',
    camera_permission: '需要相机权限',
    camera_permission_desc: '请在设置中开启相机权限以继续使用',
    
    // 分析
    analysis_title: '房间分析',
    analysis_loading: 'AI正在分析房间...',
    analysis_room_info: '房间信息',
    analysis_room_type: '类型',
    analysis_room_size: '估计尺寸',
    analysis_current_style: '当前风格',
    analysis_furniture: '识别的家具',
    analysis_issues: '发现的问题',
    analysis_continue: '继续定制设计',
    
    // 偏好设置
    preferences_title: '设计偏好',
    preferences_style: '选择风格',
    preferences_budget: '预算范围',
    preferences_needs: '特殊需求',
    preferences_colors: '色彩偏好',
    preferences_furniture_hint: '家具意见 (AI会严格采纳)',
    preferences_generate: '生成设计方案',
    
    // 设计结果
    results_title: '设计方案',
    results_generating: 'AI正在生成设计...',
    results_ar_preview: 'AR预览这个设计',
    results_furniture_list: '推荐家具清单',
    results_total_cost: '预计总成本',
    results_view_detail: '查看详情',
    
    // AR预览
    ar_title: 'AR预览',
    ar_hint: '移动手机扫描平面',
    ar_rotate: '旋转',
    ar_scale: '缩放',
    ar_delete: '删除',
    ar_capture: '截图',
    
    // 历史
    history_title: '设计历史',
    history_empty: '暂无设计历史',
    
    // 个人中心
    profile_title: '我的',
    profile_login: '登录/注册',
    profile_logout: '退出登录',
    profile_settings: '设置',
    profile_language: '语言',
    profile_help: '帮助与反馈',
    profile_about: '关于',
    
    // 登录
    login_title: '登录',
    login_email: '邮箱',
    login_password: '密码',
    login_submit: '登录',
    login_register: '注册新账号',
    login_forgot: '忘记密码?',
    
    // 风格选项
    style_modern: '现代简约',
    style_nordic: '北欧风格',
    style_japanese: '日式和风',
    style_chinese: '新中式',
    style_industrial: '工业风',
    style_minimalist: '极简主义',
  },
  en: {
    // Common
    app_name: 'SmartRoom AI',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    share: 'Share',
    delete: 'Delete',
    
    // Home
    home_title: 'Interior Design AI',
    home_capture: 'Capture Room',
    home_gallery: 'Choose from Gallery',
    home_favorites: 'Favorites',
    home_my_designs: 'My Designs',
    home_explore: 'Explore Inspiration',
    
    // Camera
    camera_hint: 'Try to include the entire room',
    camera_permission: 'Camera Permission Required',
    camera_permission_desc: 'Please enable camera permission in settings to continue',
    
    // Analysis
    analysis_title: 'Room Analysis',
    analysis_loading: 'AI is analyzing your room...',
    analysis_room_info: 'Room Info',
    analysis_room_type: 'Type',
    analysis_room_size: 'Estimated Size',
    analysis_current_style: 'Current Style',
    analysis_furniture: 'Detected Furniture',
    analysis_issues: 'Issues Found',
    analysis_continue: 'Continue to Design',
    
    // Preferences
    preferences_title: 'Design Preferences',
    preferences_style: 'Choose Style',
    preferences_budget: 'Budget Range',
    preferences_needs: 'Special Needs',
    preferences_colors: 'Color Preferences',
    preferences_furniture_hint: 'Furniture Suggestions (AI will strictly follow)',
    preferences_generate: 'Generate Design',
    
    // Design Results
    results_title: 'Design Proposals',
    results_generating: 'AI is generating designs...',
    results_ar_preview: 'AR Preview This Design',
    results_furniture_list: 'Recommended Furniture',
    results_total_cost: 'Estimated Total Cost',
    results_view_detail: 'View Details',
    
    // AR Preview
    ar_title: 'AR Preview',
    ar_hint: 'Move your phone to scan surfaces',
    ar_rotate: 'Rotate',
    ar_scale: 'Scale',
    ar_delete: 'Delete',
    ar_capture: 'Capture',
    
    // History
    history_title: 'Design History',
    history_empty: 'No design history yet',
    
    // Profile
    profile_title: 'Profile',
    profile_login: 'Login / Register',
    profile_logout: 'Logout',
    profile_settings: 'Settings',
    profile_language: 'Language',
    profile_help: 'Help & Feedback',
    profile_about: 'About',
    
    // Login
    login_title: 'Login',
    login_email: 'Email',
    login_password: 'Password',
    login_submit: 'Login',
    login_register: 'Create Account',
    login_forgot: 'Forgot Password?',
    
    // Style options
    style_modern: 'Modern',
    style_nordic: 'Nordic',
    style_japanese: 'Japanese',
    style_chinese: 'Chinese',
    style_industrial: 'Industrial',
    style_minimalist: 'Minimalist',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.zh;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_language', lang);
  };

  // 初始化语言设置
  React.useEffect(() => {
    AsyncStorage.getItem('app_language').then((savedLang) => {
      if (savedLang === 'zh' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    });
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { translations };

