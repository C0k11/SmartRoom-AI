import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../lib/i18n';
import { useDesignStore } from '../store';

export default function HistoryScreen() {
  const { t, language } = useLanguage();
  const { savedDesigns, removeSavedDesign } = useDesignStore();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      t.delete,
      language === 'zh' 
        ? `确定删除"${name}"吗？` 
        : `Delete "${name}"?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            removeSavedDesign(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof savedDesigns[0] }) => (
    <TouchableOpacity 
      style={styles.designCard}
      activeOpacity={0.9}
      onLongPress={() => handleDelete(item.id, item.name)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.designImage}
        resizeMode="cover"
      />
      <View style={styles.designInfo}>
        <Text style={styles.designName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.designCost}>
          CAD ${item.totalCost.toLocaleString()}
        </Text>
        <Text style={styles.designItems}>
          {item.furniture.length} {language === 'zh' ? '件家具' : 'items'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.name)}
      >
        <Text style={styles.deleteIcon}>X</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.history_title}</Text>
        {savedDesigns.length > 0 && (
          <Text style={styles.count}>
            {savedDesigns.length} {language === 'zh' ? '个设计' : 'designs'}
          </Text>
        )}
      </View>

      {savedDesigns.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>{t.history_empty}</Text>
          <Text style={styles.emptySubtitle}>
            {language === 'zh' 
              ? '保存的设计方案会显示在这里' 
              : 'Saved designs will appear here'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={savedDesigns}
          renderItem={renderItem}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  count: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  designCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  designImage: {
    width: 100,
    height: 100,
  },
  designInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  designName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  designCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066FF',
    marginBottom: 4,
  },
  designItems: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

