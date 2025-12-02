import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useDesignStore } from '../store';
import type { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Simple Icon Components
const CameraIcon = () => (
  <View style={iconStyles.camera}>
    <View style={iconStyles.cameraLens} />
  </View>
);

const GalleryIcon = () => (
  <View style={iconStyles.gallery}>
    <View style={iconStyles.galleryMountain} />
    <View style={iconStyles.gallerySun} />
  </View>
);

const StarIcon = () => (
  <View style={iconStyles.star} />
);

const HomeIcon = () => (
  <View style={iconStyles.home}>
    <View style={iconStyles.homeRoof} />
    <View style={iconStyles.homeBody} />
  </View>
);

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { savedDesigns } = useDesignStore();

  const handleCapture = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Camera');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {isAuthenticated ? `Hi, ${user?.name || 'User'}` : 'Welcome'}
            </Text>
            <Text style={styles.title}>{t.home_title}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
              <Text style={styles.langText}>{language === 'zh' ? 'EN' : '中'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Capture Button */}
        <TouchableOpacity onPress={handleCapture} activeOpacity={0.9}>
          <LinearGradient
            colors={['#0066FF', '#0052CC']}
            style={styles.captureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.captureIcon}>
              <CameraIcon />
            </View>
            <Text style={styles.captureTitle}>{t.home_capture}</Text>
            <Text style={styles.captureSubtitle}>
              {language === 'zh' 
                ? '拍摄或上传房间照片，AI将为您生成专业设计方案' 
                : 'Take or upload a room photo, AI will generate professional designs'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction} 
            onPress={handleCapture}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#E8F4FF' }]}>
              <GalleryIcon />
            </View>
            <Text style={styles.quickText}>{t.home_gallery}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Main', { screen: 'History' } as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#FFF4E8' }]}>
              <StarIcon />
            </View>
            <Text style={styles.quickText}>{t.home_favorites}</Text>
          </TouchableOpacity>
        </View>

        {/* My Designs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.home_my_designs}</Text>
          
          {savedDesigns.length === 0 ? (
            <View style={styles.emptyState}>
              <HomeIcon />
              <Text style={styles.emptyText}>
                {language === 'zh' 
                  ? '还没有设计方案，开始拍照吧！' 
                  : 'No designs yet. Start capturing!'}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {savedDesigns.slice(0, 5).map((design) => (
                <TouchableOpacity key={design.id} style={styles.designCard}>
                  <Image
                    source={{ uri: design.imageUrl }}
                    style={styles.designImage}
                  />
                  <Text style={styles.designName} numberOfLines={1}>
                    {design.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Explore Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.home_explore}</Text>
          <View style={styles.exploreGrid}>
            {[
              { style: t.style_modern, color: '#0066FF' },
              { style: t.style_nordic, color: '#22C55E' },
              { style: t.style_japanese, color: '#F59E0B' },
              { style: t.style_minimalist, color: '#8B5CF6' },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.exploreItem}>
                <View style={[styles.exploreIcon, { backgroundColor: item.color + '15' }]}>
                  <View style={[styles.exploreDot, { backgroundColor: item.color }]} />
                </View>
                <Text style={styles.exploreText}>{item.style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const iconStyles = StyleSheet.create({
  camera: {
    width: 40,
    height: 32,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  gallery: {
    width: 28,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0066FF',
    overflow: 'hidden',
    position: 'relative',
  },
  galleryMountain: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0066FF',
  },
  gallerySun: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0066FF',
  },
  star: {
    width: 24,
    height: 24,
    backgroundColor: '#F59E0B',
    transform: [{ rotate: '45deg' }],
  },
  home: {
    alignItems: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#94A3B8',
  },
  homeBody: {
    width: 36,
    height: 24,
    backgroundColor: '#94A3B8',
    marginTop: -2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  captureCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  captureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  captureSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
  },
  designCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  designImage: {
    width: '100%',
    height: 120,
  },
  designName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    padding: 12,
  },
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exploreItem: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exploreIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exploreDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
});
