import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { useLanguage } from '../lib/i18n';
import { useDesignStore, DesignProposal } from '../store';
import { designApi } from '../lib/api';
import type { RootStackParamList } from '../navigation';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'DesignResults'>;

// Fallback design data with i18n support
const fallbackDesignsData = {
  zh: [
    {
      id: 'fallback-1',
      name: '都市雅韵',
      description: '融合现代简约与北欧温暖，打造都市人的理想居所',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      style: '现代简约 + 北欧',
      confidence: 0.95,
      highlights: ['开放式布局', '自然光优化', '多功能储物'],
      totalCost: 8500,
      furniture: [
        { id: 'f1', name: '北欧布艺沙发', category: '沙发', price: 3200, currency: 'CAD', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', dimensions: '220x85x80cm', brand: 'IKEA', links: [{ platform: 'IKEA', url: 'https://www.ikea.cn', name: 'IKEA', price: 3200 }] },
        { id: 'f2', name: '原木茶几', category: '茶几', price: 1200, currency: 'CAD', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200', dimensions: '120x60x45cm', brand: 'Muji', links: [{ platform: 'Amazon', url: 'https://www.amazon.com', name: 'Amazon', price: 1200 }] },
      ],
    },
    {
      id: 'fallback-2',
      name: '禅意栖居',
      description: '极简日式美学，营造宁静致远的生活空间',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
      style: '日式禅风',
      confidence: 0.92,
      highlights: ['极简设计', '自然材质', '禅意氛围'],
      totalCost: 7200,
      furniture: [
        { id: 'f5', name: '榻榻米沙发', category: '沙发', price: 2800, currency: 'CAD', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', dimensions: '200x90x35cm', brand: 'Muji', links: [{ platform: 'Muji', url: 'https://www.muji.com', name: 'Muji', price: 2800 }] },
      ],
    },
  ],
  en: [
    {
      id: 'fallback-1',
      name: 'Urban Elegance',
      description: 'Blending modern minimalism with Nordic warmth, creating the ideal urban dwelling',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      style: 'Modern + Nordic',
      confidence: 0.95,
      highlights: ['Open Layout', 'Natural Light', 'Multi-functional Storage'],
      totalCost: 8500,
      furniture: [
        { id: 'f1', name: 'Nordic Fabric Sofa', category: 'Sofa', price: 3200, currency: 'CAD', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', dimensions: '220x85x80cm', brand: 'IKEA', links: [{ platform: 'IKEA', url: 'https://www.ikea.com', name: 'IKEA', price: 3200 }] },
        { id: 'f2', name: 'Solid Wood Coffee Table', category: 'Table', price: 1200, currency: 'CAD', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200', dimensions: '120x60x45cm', brand: 'Muji', links: [{ platform: 'Amazon', url: 'https://www.amazon.com', name: 'Amazon', price: 1200 }] },
      ],
    },
    {
      id: 'fallback-2',
      name: 'Zen Retreat',
      description: 'Minimalist Japanese aesthetics, creating a serene and peaceful living space',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
      style: 'Japanese Zen',
      confidence: 0.92,
      highlights: ['Minimalist Design', 'Natural Materials', 'Zen Atmosphere'],
      totalCost: 7200,
      furniture: [
        { id: 'f5', name: 'Tatami Sofa', category: 'Sofa', price: 2800, currency: 'CAD', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', dimensions: '200x90x35cm', brand: 'Muji', links: [{ platform: 'Muji', url: 'https://www.muji.com', name: 'Muji', price: 2800 }] },
      ],
    },
  ],
};

export default function DesignResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t, language } = useLanguage();
  const { 
    proposals, 
    setProposals, 
    selectedDesign,
    setSelectedDesign,
    isGenerating, 
    setIsGenerating,
    progress,
    setProgress,
    statusMessage,
    setStatusMessage,
    error,
    setError,
    addSavedDesign,
    currentAnalysis,
    uploadedImage,
    favorites,
    toggleFavorite,
  } = useDesignStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'furniture'>('preview');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const isGeneratingRef = useRef(false);
  const currentJobIdRef = useRef<string | null>(null);

  const { preferences } = route.params;

  // Progress steps
  const progressSteps = [
    { label: language === 'zh' ? '分析设计需求' : 'Analyzing requirements', threshold: 20 },
    { label: language === 'zh' ? '生成设计理念' : 'Generating concepts', threshold: 45 },
    { label: language === 'zh' ? '渲染效果图' : 'Rendering images', threshold: 70 },
    { label: language === 'zh' ? '匹配家具产品' : 'Matching furniture', threshold: 90 },
  ];

  useEffect(() => {
    if (!isGeneratingRef.current && proposals.length === 0) {
      generateDesigns();
    } else if (proposals.length > 0) {
      setSelectedDesign(proposals[0]);
    }
  }, []);

  const generateDesigns = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    currentJobIdRef.current = null;
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setStatusMessage(language === 'zh' ? '开始生成设计方案...' : 'Starting design generation...');

    try {
      // 调用后端API生成设计
      const result = await designApi.generate(
        preferences.analysisId || currentAnalysis?.id || 'demo',
        preferences,
        language
      );

      const jobId = result.id;
      currentJobIdRef.current = jobId;

      // 轮询获取结果
      let designResult = null;
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts && currentJobIdRef.current === jobId) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const status = await designApi.getStatus(jobId);
          const currentProgress = status.progress || 0;
          setProgress(currentProgress);

          // Update status message based on progress
          if (currentProgress < 30) {
            setStatusMessage(language === 'zh' ? '正在分析设计需求...' : 'Analyzing requirements...');
          } else if (currentProgress < 60) {
            setStatusMessage(language === 'zh' ? '正在生成设计理念...' : 'Generating concepts...');
          } else if (currentProgress < 90) {
            setStatusMessage(language === 'zh' ? '正在渲染效果图...' : 'Rendering images...');
          } else {
            setStatusMessage(language === 'zh' ? '正在匹配家具产品...' : 'Matching furniture...');
          }

          if (status.status === 'completed' && status.proposals) {
            designResult = status;
            break;
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Design generation failed');
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
          throw pollError;
        }

        attempts++;
      }

      if (!designResult) {
        throw new Error('Design generation timeout');
      }

      // 处理设计方案
      const formattedProposals: DesignProposal[] = (designResult.proposals || []).map((p: any) => ({
        id: p.id || Math.random().toString(36).substr(2, 9),
        name: p.name || p.title,
        description: p.description || '',
        image: p.image_url || p.imageUrl,
        imageUrl: p.image_url || p.imageUrl,
        style: p.style || '',
        confidence: p.confidence || 0.9,
        highlights: p.highlights || [],
        totalCost: p.totalCost || p.total_cost || 0,
        furniture: (p.furniture || []).map((f: any) => ({
          id: f.id || Math.random().toString(36).substr(2, 9),
          name: f.name,
          name_en: f.name_en,
          category: f.category || '',
          price: f.price,
          currency: f.currency || 'CAD',
          image: f.image || f.image_url,
          imageUrl: f.image || f.image_url,
          dimensions: f.dimensions,
          brand: f.brand,
          links: f.links || [],
        })),
      }));

      setProposals(formattedProposals);
      setSelectedDesign(formattedProposals[0]);
      setProgress(100);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        language === 'zh' ? '成功' : 'Success',
        language === 'zh' ? '设计方案生成完成！' : 'Design generation complete!'
      );

    } catch (err: any) {
      console.error('Design generation error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Generation failed';
      setError(errorMessage);
      
      // Use fallback data
      const fallbackDesigns = fallbackDesignsData[language] as DesignProposal[];
      setProposals(fallbackDesigns);
      setSelectedDesign(fallbackDesigns[0]);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        language === 'zh' ? '提示' : 'Notice',
        language === 'zh' ? '无法连接服务器，显示示例方案' : 'Cannot connect to server, showing sample designs'
      );
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setProposals([]);
    setSelectedDesign(null);
    generateDesigns();
  };

  const handleSave = async () => {
    const proposal = proposals[currentIndex];
    if (proposal) {
      addSavedDesign(proposal);
      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        language === 'zh' ? '成功' : 'Success',
        language === 'zh' ? '设计已保存！' : 'Design saved!'
      );
    }
  };

  const handleShare = async () => {
    const proposal = proposals[currentIndex];
    if (proposal) {
      try {
        await Share.share({
          message: language === 'zh' 
            ? `查看我的室内设计方案：${proposal.name}\n${proposal.description}`
            : `Check out my interior design: ${proposal.name}\n${proposal.description}`,
          title: proposal.name,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleDownload = async () => {
    const proposal = proposals[currentIndex];
    if (!proposal) return;
    
    const imageUrl = proposal.image || proposal.imageUrl;
    if (!imageUrl) return;

    try {
      const filename = `${proposal.name.replace(/\s+/g, '_')}_design.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          language === 'zh' ? '成功' : 'Success',
          language === 'zh' ? '图片已保存到应用文档' : 'Image saved to app documents'
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        language === 'zh' ? '错误' : 'Error',
        language === 'zh' ? '下载失败' : 'Download failed'
      );
    }
  };

  const handleARPreview = () => {
    const proposal = proposals[currentIndex];
    if (proposal) {
      navigation.navigate('ARPreview', {
        furnitureList: proposal.furniture,
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openProductLink = (url: string) => {
    Linking.openURL(url);
  };

  const formatCurrency = (value: number) => {
    return `CAD $${value.toLocaleString()}`;
  };

  const currentProposal = proposals[currentIndex];

  // Loading State with progress steps
  if (isGenerating || proposals.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          {/* Animated loader */}
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0066FF" />
          </View>
          
          <Text style={styles.loadingTitle}>{t.results_generating}</Text>
          <Text style={styles.loadingSubtitle}>{statusMessage}</Text>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{language === 'zh' ? '生成进度' : 'Progress'}</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* Progress steps */}
          <View style={styles.stepsContainer}>
            {progressSteps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[
                  styles.stepIndicator,
                  progress >= step.threshold + 20 && styles.stepCompleted,
                  progress >= step.threshold && progress < step.threshold + 20 && styles.stepActive,
                ]}>
                  {progress >= step.threshold + 20 ? (
                    <Text style={styles.stepCheckmark}>{'\u2713'}</Text>
                  ) : progress >= step.threshold ? (
                    <ActivityIndicator size="small" color="#0066FF" />
                  ) : null}
                </View>
                <Text style={[
                  styles.stepLabel,
                  progress >= step.threshold && styles.stepLabelActive,
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.results_title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleFavorite(currentProposal?.id || '')}
          >
            <Text style={[
              styles.heartIcon,
              favorites.includes(currentProposal?.id || '') && styles.heartIconActive
            ]}>
              {favorites.includes(currentProposal?.id || '') ? '\u2764\uFE0F' : '\uD83E\uDD0D'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preview' && styles.tabActive]}
          onPress={() => setActiveTab('preview')}
        >
          <Text style={[styles.tabText, activeTab === 'preview' && styles.tabTextActive]}>
            {t.results_preview}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'furniture' && styles.tabActive]}
          onPress={() => setActiveTab('furniture')}
        >
          <Text style={[styles.tabText, activeTab === 'furniture' && styles.tabTextActive]}>
            {t.results_shopping_list}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'preview' ? (
          <>
            {/* Design Image Carousel */}
            <View style={styles.carouselContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentIndex(index);
                  setIsSaved(false);
                }}
              >
                {proposals.map((proposal, index) => (
                  <TouchableOpacity 
                    key={proposal.id} 
                    style={styles.imageSlide}
                    onPress={() => setShowFullscreen(true)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: proposal.image || proposal.imageUrl }}
                      style={styles.designImage}
                      resizeMode="cover"
                    />
                    {/* Match confidence badge */}
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>
                        {t.results_match} {Math.round((proposal.confidence || 0.9) * 100)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Pagination Dots */}
              <View style={styles.pagination}>
                {proposals.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Design Info */}
            {currentProposal && (
              <>
                <View style={styles.designInfo}>
                  <View style={styles.designHeader}>
                    <View style={styles.designTitleContainer}>
                      <Text style={styles.designName}>{currentProposal.name}</Text>
                      <Text style={styles.designStyle}>{currentProposal.style}</Text>
                    </View>
                    <Text style={styles.designCost}>{formatCurrency(currentProposal.totalCost)}</Text>
                  </View>
                  <Text style={styles.designDescription}>
                    {currentProposal.description}
                  </Text>
                  
                  {/* Highlights */}
                  {currentProposal.highlights && currentProposal.highlights.length > 0 && (
                    <View style={styles.highlightsContainer}>
                      {currentProposal.highlights.map((highlight, i) => (
                        <View key={i} style={styles.highlightTag}>
                          <Text style={styles.highlightText}>{highlight}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setShowFullscreen(true)}>
                    <Text style={styles.actionBtnIcon}>{'\uD83D\uDD0D'}</Text>
                    <Text style={styles.actionBtnText}>{t.fullscreen}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                    <Text style={styles.actionBtnIcon}>{'\u2B07\uFE0F'}</Text>
                    <Text style={styles.actionBtnText}>{t.download}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                    <Text style={styles.actionBtnIcon}>{'\uD83D\uDCE4'}</Text>
                    <Text style={styles.actionBtnText}>{t.share}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
                    <Text style={styles.actionBtnIcon}>{isSaved ? '\u2705' : '\uD83D\uDCBE'}</Text>
                    <Text style={styles.actionBtnText}>{t.save}</Text>
                  </TouchableOpacity>
                </View>

                {/* AR Preview Button */}
                <TouchableOpacity 
                  style={styles.arButton}
                  onPress={handleARPreview}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.arButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.arText}>{t.results_ar_preview}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Regenerate Button */}
                <TouchableOpacity 
                  style={styles.regenerateButton}
                  onPress={handleRegenerate}
                >
                  <Text style={styles.regenerateText}>{t.regenerate}</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          /* Furniture Tab */
          <View style={styles.furnitureSection}>
            <Text style={styles.furnitureTitle}>
              {t.results_furniture_list}
            </Text>
            
            {currentProposal?.furniture.map((item) => (
              <View key={item.id} style={styles.furnitureCard}>
                {(item.image || item.imageUrl) && (
                  <Image 
                    source={{ uri: item.image || item.imageUrl }} 
                    style={styles.furnitureImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.furnitureInfo}>
                  <Text style={styles.furnitureName}>{item.name}</Text>
                  {item.brand && <Text style={styles.furnitureBrand}>{item.brand}</Text>}
                  {item.dimensions && <Text style={styles.furnitureDimensions}>{item.dimensions}</Text>}
                  <Text style={styles.furniturePrice}>
                    {item.currency || 'CAD'} ${item.price.toLocaleString()}
                  </Text>
                  
                  {/* Platform Links */}
                  {item.links && item.links.length > 0 && (
                    <View style={styles.linksContainer}>
                      {item.links.slice(0, 3).map((link, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.linkButton}
                          onPress={() => openProductLink(link.url)}
                        >
                          <Text style={styles.linkText}>{link.platform || link.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Total Cost */}
            {currentProposal && (
              <View style={styles.totalCost}>
                <Text style={styles.totalLabel}>{t.results_total_cost}</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(currentProposal.totalCost)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={showFullscreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullscreen(false)}
      >
        <View style={styles.fullscreenModal}>
          <TouchableOpacity 
            style={styles.fullscreenClose}
            onPress={() => setShowFullscreen(false)}
          >
            <Text style={styles.fullscreenCloseText}>{'\u2715'}</Text>
          </TouchableOpacity>
          {currentProposal && (
            <Image
              source={{ uri: currentProposal.image || currentProposal.imageUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
    width: '100%',
  },
  loaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    width: width - 80,
    marginBottom: 32,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066FF',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 4,
  },
  stepsContainer: {
    width: width - 80,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  stepActive: {
    borderColor: '#0066FF',
  },
  stepCheckmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#FFFFFF',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#334155',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
  },
  heartIcon: {
    fontSize: 20,
  },
  heartIconActive: {
    color: '#EF4444',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0066FF',
    fontWeight: '600',
  },
  carouselContainer: {
    position: 'relative',
  },
  imageSlide: {
    width,
    height: 280,
    position: 'relative',
  },
  designImage: {
    width: '100%',
    height: '100%',
  },
  confidenceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  designInfo: {
    padding: 20,
  },
  designHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  designTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  designName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  designStyle: {
    fontSize: 14,
    color: '#64748B',
  },
  designCost: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066FF',
  },
  designDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 12,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  highlightText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionBtn: {
    alignItems: 'center',
    padding: 12,
  },
  actionBtnIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#64748B',
  },
  arButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  arButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  arIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  arText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  regenerateButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  regenerateText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  furnitureSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  furnitureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  furnitureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  furnitureImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  furnitureInfo: {
    flex: 1,
  },
  furnitureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  furnitureBrand: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  furnitureDimensions: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  furniturePrice: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '600',
    marginBottom: 8,
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  totalCost: {
    backgroundColor: '#0066FF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullscreenCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fullscreenImage: {
    width: width,
    height: height * 0.8,
  },
});

