import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../lib/i18n';
import type { RootStackParamList } from '../navigation';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ARPreview'>;

// Note: 实际AR功能需要集成ViroReact或expo-three
// 这里先提供UI框架，AR功能后续集成

export default function ARPreviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t, language } = useLanguage();
  
  const { furnitureList } = route.params;
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<any[]>([]);

  const handleSelectFurniture = (id: string) => {
    setSelectedFurniture(id);
    Haptics.selectionAsync();
  };

  const handleCapture = () => {
    Alert.alert(
      language === 'zh' ? '截图已保存' : 'Screenshot Saved',
      language === 'zh' ? '已保存到相册' : 'Saved to camera roll'
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePlaceFurniture = () => {
    if (selectedFurniture) {
      const furniture = furnitureList.find(f => f.id === selectedFurniture);
      if (furniture) {
        setPlacedItems(prev => [...prev, { ...furniture, position: { x: 0, y: 0, z: 0 } }]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* AR View Placeholder */}
      <View style={styles.arView}>
        <View style={styles.arPlaceholder}>
          <View style={styles.arPlaceholderIcon} />
          <Text style={styles.arPlaceholderTitle}>
            {language === 'zh' ? 'AR预览' : 'AR Preview'}
          </Text>
          <Text style={styles.arPlaceholderText}>{t.ar_hint}</Text>
          
          {/* Show placed items */}
          {placedItems.length > 0 && (
            <View style={styles.placedItemsInfo}>
              <Text style={styles.placedItemsText}>
                {language === 'zh' 
                  ? `已放置 ${placedItems.length} 件家具` 
                  : `${placedItems.length} items placed`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeIcon}>X</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoIcon}>i</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Furniture Selector */}
        <Text style={styles.selectorTitle}>
          {language === 'zh' ? '选择家具' : 'Select Furniture'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.furnitureScroll}
          contentContainerStyle={styles.furnitureScrollContent}
        >
          {furnitureList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.furnitureItem,
                selectedFurniture === item.id && styles.furnitureItemSelected,
              ]}
              onPress={() => handleSelectFurniture(item.id)}
            >
              <View style={styles.furnitureIcon} />
              <Text style={styles.furnitureLabel} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AR Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Haptics.selectionAsync()}
          >
            <Text style={styles.controlLabel}>{t.ar_rotate}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Haptics.selectionAsync()}
          >
            <Text style={styles.controlLabel}>{t.ar_scale}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              if (placedItems.length > 0) {
                setPlacedItems(prev => prev.slice(0, -1));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Text style={styles.controlLabel}>{t.ar_delete}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.captureButton]}
            onPress={handleCapture}
          >
            <Text style={styles.controlLabel}>{t.ar_capture}</Text>
          </TouchableOpacity>
        </View>

        {/* Place Button */}
        {selectedFurniture && (
          <TouchableOpacity 
            style={styles.placeButton}
            onPress={handlePlaceFurniture}
          >
            <Text style={styles.placeButtonText}>
              {language === 'zh' ? '放置家具' : 'Place Furniture'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  arView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arPlaceholder: {
    alignItems: 'center',
    padding: 40,
  },
  arPlaceholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  arPlaceholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  arPlaceholderText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  placedItemsInfo: {
    marginTop: 24,
    backgroundColor: 'rgba(0,102,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  placedItemsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
  },
  bottomPanel: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  furnitureScroll: {
    marginHorizontal: -20,
  },
  furnitureScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  furnitureItem: {
    width: 80,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  furnitureItemSelected: {
    backgroundColor: '#0066FF',
  },
  furnitureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  furnitureLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  captureButton: {
    backgroundColor: '#0066FF',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  placeButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  placeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

