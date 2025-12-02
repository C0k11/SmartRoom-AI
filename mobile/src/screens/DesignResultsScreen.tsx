import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../lib/i18n';
import { useDesignStore } from '../store';
import { designApi } from '../lib/api';
import type { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'DesignResults'>;

export default function DesignResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t, language } = useLanguage();
  const { 
    proposals, 
    setProposals, 
    isGenerating, 
    setIsGenerating,
    progress,
    setProgress,
    addSavedDesign,
    currentAnalysis,
  } = useDesignStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const isGeneratingRef = useRef(false);

  const { preferences } = route.params;

  useEffect(() => {
    if (!isGeneratingRef.current && proposals.length === 0) {
      generateDesigns();
    }
  }, []);

  const generateDesigns = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setProgress(0);

    try {
      // 调用后端API生成设计
      const result = await designApi.generate(
        preferences.analysisId || currentAnalysis?.id || 'demo',
        preferences
      );

      const jobId = result.id;

      // 轮询获取结果
      let designResult = null;
      let attempts = 0;
      const maxAttempts = 60; // 最多等待2分钟

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const status = await designApi.getStatus(jobId);

        if (status.progress) {
          setProgress(status.progress);
        }

        if (status.status === 'completed') {
          designResult = status;
          break;
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Design generation failed');
        }

        attempts++;
      }

      if (!designResult) {
        throw new Error('Design generation timeout');
      }

      // 处理设计方案
      const formattedProposals = (designResult.proposals || []).map((p: any) => ({
        id: p.id || Math.random().toString(36).substr(2, 9),
        name: p.name || p.title,
        imageUrl: p.imageUrl || p.image_url,
        description: p.description,
        furniture: (p.furniture || []).map((f: any) => ({
          id: f.id || Math.random().toString(36).substr(2, 9),
          name: f.name,
          price: f.price,
          currency: f.currency || 'CAD',
          imageUrl: f.image_url,
          links: f.links || [],
        })),
        totalCost: p.totalCost || p.total_cost || 0,
      }));

      setProposals(formattedProposals);
      setProgress(100);
      
      // 触觉反馈
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error('Design generation error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const handleSave = () => {
    if (proposals[currentIndex]) {
      addSavedDesign(proposals[currentIndex]);
      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleARPreview = () => {
    if (proposals[currentIndex]) {
      navigation.navigate('ARPreview', {
        furnitureList: proposals[currentIndex].furniture,
      });
    }
  };

  const openProductLink = (url: string) => {
    Linking.openURL(url);
  };

  const currentProposal = proposals[currentIndex];

  // Loading State
  if (isGenerating || proposals.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingTitle}>{t.results_generating}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.results_title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, isSaved && styles.actionButtonActive]}
            onPress={handleSave}
          >
            <Text style={[styles.actionIcon, isSaved && styles.actionIconActive]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
              <View key={proposal.id} style={styles.imageSlide}>
                <Image
                  source={{ uri: proposal.imageUrl }}
                  style={styles.designImage}
                  resizeMode="cover"
                />
              </View>
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
              <Text style={styles.designName}>{currentProposal.name}</Text>
              <Text style={styles.designDescription}>
                {currentProposal.description}
              </Text>
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

            {/* Furniture List */}
            <View style={styles.furnitureSection}>
              <Text style={styles.furnitureTitle}>
                {t.results_furniture_list}
              </Text>
              
              {currentProposal.furniture.map((item) => (
                <View key={item.id} style={styles.furnitureCard}>
                  <View style={styles.furnitureInfo}>
                    <Text style={styles.furnitureName}>{item.name}</Text>
                    <Text style={styles.furniturePrice}>
                      {item.currency} ${item.price.toLocaleString()}
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
                            <Text style={styles.linkText}>{link.platform}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Total Cost */}
              <View style={styles.totalCost}>
                <Text style={styles.totalLabel}>{t.results_total_cost}</Text>
                <Text style={styles.totalValue}>
                  CAD ${currentProposal.totalCost.toLocaleString()}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 24,
  },
  progressBar: {
    width: width - 80,
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
  progressText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
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
  carouselContainer: {
    position: 'relative',
  },
  imageSlide: {
    width,
    height: 280,
  },
  designImage: {
    width: '100%',
    height: '100%',
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
  designName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  designDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  arButton: {
    marginHorizontal: 16,
    marginBottom: 24,
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
  furnitureSection: {
    paddingHorizontal: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  furnitureInfo: {
    flex: 1,
  },
  furnitureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  furniturePrice: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '600',
    marginBottom: 12,
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
});

