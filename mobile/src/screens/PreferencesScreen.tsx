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

// Color palette options matching web frontend
const COLOR_OPTIONS = [
  { id: 'neutral', colors: ['#FFFFFF', '#E5E5E5', '#8B8B8B', '#2D2D2D'] },
  { id: 'warm', colors: ['#FFF5E6', '#FFB347', '#D2691E', '#8B4513'] },
  { id: 'cool', colors: ['#E6F3FF', '#87CEEB', '#4682B4', '#1E3A5F'] },
  { id: 'earth', colors: ['#F5F5DC', '#C4A77D', '#8B7355', '#556B2F'] },
  { id: 'pastel', colors: ['#FFE4E1', '#E0BBE4', '#957DAD', '#D4A5A5'] },
  { id: 'bold', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96C93D'] },
];

// Requirement options matching web frontend
const REQUIREMENT_OPTIONS = [
  { id: 'workspace' },
  { id: 'gaming' },
  { id: 'reading' },
  { id: 'pet' },
  { id: 'kids' },
  { id: 'storage' },
  { id: 'plants' },
  { id: 'entertainment' },
];

// Legacy simple colors for backward compatibility
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
  const [selectedColorPalettes, setSelectedColorPalettes] = useState<string[]>(preferences.colorPreference || []);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(preferences.requirements || []);
  const [specialNeeds, setSpecialNeeds] = useState(preferences.specialNeeds);
  const [furnitureSuggestions, setFurnitureSuggestions] = useState(preferences.furnitureSuggestions);
  const [additionalNotes, setAdditionalNotes] = useState(preferences.additionalNotes || '');

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

  const getColorLabel = (id: string) => {
    const labels: Record<string, string> = {
      neutral: language === 'zh' ? '中性色' : 'Neutral',
      warm: language === 'zh' ? '暖色调' : 'Warm',
      cool: language === 'zh' ? '冷色调' : 'Cool',
      earth: language === 'zh' ? '大地色' : 'Earth',
      pastel: language === 'zh' ? '糖果色' : 'Pastel',
      bold: language === 'zh' ? '鲜艳色' : 'Bold',
    };
    return labels[id] || id;
  };

  const getRequirementLabel = (id: string) => {
    const labels: Record<string, string> = {
      workspace: language === 'zh' ? '工作区域' : 'Workspace',
      gaming: language === 'zh' ? '游戏空间' : 'Gaming',
      reading: language === 'zh' ? '阅读角落' : 'Reading',
      pet: language === 'zh' ? '宠物友好' : 'Pet-friendly',
      kids: language === 'zh' ? '儿童安全' : 'Kid-safe',
      storage: language === 'zh' ? '更多收纳' : 'Storage',
      plants: language === 'zh' ? '绿植空间' : 'Plants',
      entertainment: language === 'zh' ? '娱乐中心' : 'Entertainment',
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

  const toggleColorPalette = (paletteId: string) => {
    setSelectedColorPalettes(prev =>
      prev.includes(paletteId)
        ? prev.filter(c => c !== paletteId)
        : [...prev, paletteId]
    );
  };

  const toggleRequirement = (reqId: string) => {
    setSelectedRequirements(prev =>
      prev.includes(reqId)
        ? prev.filter(r => r !== reqId)
        : [...prev, reqId]
    );
  };

  const handleGenerate = () => {
    // 保存偏好
    setPreferences({
      style: selectedStyle,
      budget,
      colors: selectedColors,
      colorPreference: selectedColorPalettes,
      requirements: selectedRequirements,
      specialNeeds,
      furnitureSuggestions,
      additionalNotes,
    });

    // 导航到设计结果页面
    navigation.navigate('DesignResults', {
      designId: 'new',
      preferences: {
        style: selectedStyle,
        budget,
        budgetRange: budget,
        colors: selectedColors,
        colorPreference: selectedColorPalettes,
        requirements: selectedRequirements,
        specialNeeds,
        furnitureSuggestions,
        additionalNotes,
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

        {/* Color Palette Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences_colors}</Text>
          <View style={styles.colorPalettesContainer}>
            {COLOR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.colorPaletteCard,
                  selectedColorPalettes.includes(option.id) && styles.colorPaletteCardSelected,
                ]}
                onPress={() => toggleColorPalette(option.id)}
              >
                {selectedColorPalettes.includes(option.id) && (
                  <View style={styles.paletteCheckmark}>
                    <Text style={styles.paletteCheckmarkText}>✓</Text>
                  </View>
                )}
                <View style={styles.colorSwatches}>
                  {option.colors.map((color, i) => (
                    <View
                      key={i}
                      style={[styles.colorSwatch, { backgroundColor: color }]}
                    />
                  ))}
                </View>
                <Text style={[
                  styles.colorPaletteLabel,
                  selectedColorPalettes.includes(option.id) && styles.colorPaletteLabelSelected,
                ]}>
                  {getColorLabel(option.id)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences_requirements}</Text>
          <View style={styles.requirementsContainer}>
            {REQUIREMENT_OPTIONS.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={[
                  styles.requirementChip,
                  selectedRequirements.includes(req.id) && styles.requirementChipSelected,
                ]}
                onPress={() => toggleRequirement(req.id)}
              >
                <Text style={[
                  styles.requirementText,
                  selectedRequirements.includes(req.id) && styles.requirementTextSelected,
                ]}>
                  {getRequirementLabel(req.id)}
                </Text>
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
  // Color palette styles
  colorPalettesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorPaletteCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  colorPaletteCardSelected: {
    borderColor: '#0066FF',
    backgroundColor: '#F0F7FF',
  },
  paletteCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paletteCheckmarkText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  colorSwatches: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colorPaletteLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  colorPaletteLabelSelected: {
    color: '#0066FF',
    fontWeight: '600',
  },
  // Requirements styles
  requirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requirementChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  requirementChipSelected: {
    backgroundColor: '#0066FF',
  },
  requirementText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  requirementTextSelected: {
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

