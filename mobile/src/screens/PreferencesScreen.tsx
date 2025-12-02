import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { useLanguage } from '../lib/i18n';
import { useDesignStore } from '../store';
import type { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Preferences'>;

const STYLES = [
  { id: 'modern', color: '#0066FF' },
  { id: 'nordic', color: '#22C55E' },
  { id: 'japanese', color: '#F59E0B' },
  { id: 'chinese', color: '#EF4444' },
  { id: 'industrial', color: '#6366F1' },
  { id: 'minimalist', color: '#8B5CF6' },
];

const COLORS = [
  { name: 'white', color: '#FFFFFF', border: '#E2E8F0' },
  { name: 'gray', color: '#64748B', border: '#64748B' },
  { name: 'blue', color: '#0066FF', border: '#0066FF' },
  { name: 'green', color: '#22C55E', border: '#22C55E' },
  { name: 'yellow', color: '#EAB308', border: '#EAB308' },
  { name: 'brown', color: '#A16207', border: '#A16207' },
];

export default function PreferencesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t, language } = useLanguage();
  const { preferences, setPreferences, currentAnalysis } = useDesignStore();

  const [selectedStyle, setSelectedStyle] = useState(preferences.style);
  const [budget, setBudget] = useState(preferences.budget);
  const [selectedColors, setSelectedColors] = useState<string[]>(preferences.colors);
  const [specialNeeds, setSpecialNeeds] = useState(preferences.specialNeeds);
  const [furnitureSuggestions, setFurnitureSuggestions] = useState(preferences.furnitureSuggestions);

  const budgetProgress = useSharedValue((budget[1] - 500) / 9500);

  const getStyleLabel = (id: string) => {
    const labels: Record<string, string> = {
      modern: t.style_modern,
      nordic: t.style_nordic,
      japanese: t.style_japanese,
      chinese: t.style_chinese,
      industrial: t.style_industrial,
      minimalist: t.style_minimalist,
    };
    return labels[id] || id;
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleGenerate = () => {
    // 保存偏好
    setPreferences({
      style: selectedStyle,
      budget,
      colors: selectedColors,
      specialNeeds,
      furnitureSuggestions,
    });

    // 导航到设计结果页面
    navigation.navigate('DesignResults', {
      designId: 'new',
      preferences: {
        style: selectedStyle,
        budget,
        colors: selectedColors,
        specialNeeds,
        furnitureSuggestions,
        analysisId: currentAnalysis?.id,
      },
    });
  };

  const animatedBudgetStyle = useAnimatedStyle(() => ({
    width: `${budgetProgress.value * 100}%`,
  }));

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
        <Text style={styles.headerTitle}>{t.preferences_title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Style Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences_style}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stylesContainer}
          >
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  selectedStyle === style.id && styles.styleCardSelected,
                ]}
                onPress={() => setSelectedStyle(style.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.styleIcon, { backgroundColor: style.color + '20' }]}>
                  <View style={[styles.styleDot, { backgroundColor: style.color }]} />
                </View>
                <Text style={[
                  styles.styleLabel,
                  selectedStyle === style.id && styles.styleLabelSelected
                ]}>
                  {getStyleLabel(style.id)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Budget Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences_budget}</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetLabels}>
              <Text style={styles.budgetMin}>$500</Text>
              <Text style={styles.budgetValue}>
                ${budget[0]} - ${budget[1]}
              </Text>
              <Text style={styles.budgetMax}>$10,000</Text>
            </View>
            <View style={styles.budgetTrack}>
              <Animated.View style={[styles.budgetFill, animatedBudgetStyle]} />
            </View>
            <View style={styles.budgetButtons}>
              {[1000, 3000, 5000, 8000].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.budgetButton,
                    budget[1] === value && styles.budgetButtonActive,
                  ]}
                  onPress={() => {
                    setBudget([500, value]);
                    budgetProgress.value = withSpring((value - 500) / 9500);
                  }}
                >
                  <Text style={[
                    styles.budgetButtonText,
                    budget[1] === value && styles.budgetButtonTextActive,
                  ]}>
                    ${value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Color Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences_colors}</Text>
          <View style={styles.colorsContainer}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorButton,
                  { backgroundColor: color.color, borderColor: color.border },
                  selectedColors.includes(color.name) && styles.colorButtonSelected,
                ]}
                onPress={() => toggleColor(color.name)}
              >
                {selectedColors.includes(color.name) && (
                  <Text style={[
                    styles.colorCheck,
                    color.name === 'white' && { color: '#0066FF' }
                  ]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Furniture Suggestions - Highlighted */}
        <View style={styles.section}>
          <View style={styles.highlightHeader}>
            <Text style={styles.sectionTitle}>{t.preferences_furniture_hint}</Text>
          </View>
          <View style={styles.highlightCard}>
            <TextInput
              style={styles.highlightInput}
              placeholder={language === 'zh' 
                ? '例如：想要一张IKEA双人床、白色衣柜、带工作台...' 
                : 'e.g., IKEA queen bed, white wardrobe, workspace...'}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={furnitureSuggestions}
              onChangeText={setFurnitureSuggestions}
            />
            <View style={styles.highlightNote}>
            <Text style={styles.highlightNoteText}>
              {language === 'zh' 
                ? 'AI会严格按照您的家具意见生成设计' 
                : 'AI will strictly follow your furniture suggestions'}
            </Text>
            </View>
          </View>
        </View>

        {/* Special Needs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences_needs}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={language === 'zh' 
              ? '其他补充说明...' 
              : 'Additional notes...'}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={specialNeeds}
            onChangeText={setSpecialNeeds}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Generate Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleGenerate} activeOpacity={0.9}>
          <LinearGradient
            colors={['#0066FF', '#0052CC']}
            style={styles.generateButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.generateText}>{t.preferences_generate}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  stylesContainer: {
    paddingRight: 16,
    gap: 12,
    flexDirection: 'row',
  },
  styleCard: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  styleCardSelected: {
    borderColor: '#0066FF',
    backgroundColor: '#F0F7FF',
  },
  styleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  styleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  styleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  styleLabelSelected: {
    color: '#0066FF',
    fontWeight: '600',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetMin: {
    fontSize: 12,
    color: '#94A3B8',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066FF',
  },
  budgetMax: {
    fontSize: 12,
    color: '#94A3B8',
  },
  budgetTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 16,
  },
  budgetFill: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 4,
  },
  budgetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  budgetButtonActive: {
    backgroundColor: '#0066FF',
  },
  budgetButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  budgetButtonTextActive: {
    color: '#FFFFFF',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorButtonSelected: {
    borderWidth: 3,
  },
  colorCheck: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0066FF',
    overflow: 'hidden',
  },
  highlightInput: {
    padding: 16,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  highlightNote: {
    backgroundColor: '#0066FF',
    padding: 12,
  },
  highlightNoteText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F8FAFC',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  generateIcon: {
    fontSize: 20,
  },
});

