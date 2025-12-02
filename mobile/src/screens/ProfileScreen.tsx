import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useDesignStore } from '../store';
import type { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { savedDesigns } = useDesignStore();

  const handleLogout = () => {
    Alert.alert(
      t.profile_logout,
      language === 'zh' ? '确定要退出登录吗？' : 'Are you sure you want to logout?',
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.confirm, 
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.profile_title}</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          {isAuthenticated ? (
            <>
              <View style={styles.avatar}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{savedDesigns.length}</Text>
                  <Text style={styles.statLabel}>
                    {language === 'zh' ? '设计方案' : 'Designs'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <View style={styles.loginIconPlaceholder} />
              <Text style={styles.loginText}>{t.profile_login}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {/* Language */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={toggleLanguage}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#E8F4FF' }]}>
                <View style={[styles.menuDot, { backgroundColor: '#0066FF' }]} />
              </View>
              <Text style={styles.menuLabel}>{t.profile_language}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>
                {language === 'zh' ? '中文' : 'English'}
              </Text>
              <Text style={styles.menuArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F4E8FF' }]}>
                <View style={[styles.menuDot, { backgroundColor: '#8B5CF6' }]} />
              </View>
              <Text style={styles.menuLabel}>{t.profile_settings}</Text>
            </View>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>

          {/* Help */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#E8FFF4' }]}>
                <View style={[styles.menuDot, { backgroundColor: '#22C55E' }]} />
              </View>
              <Text style={styles.menuLabel}>{t.profile_help}</Text>
            </View>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FFF4E8' }]}>
                <View style={[styles.menuDot, { backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.menuLabel}>{t.profile_about}</Text>
            </View>
            <Text style={styles.menuArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>{t.profile_logout}</Text>
          </TouchableOpacity>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>SmartRoom AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  userCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0066FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  loginText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066FF',
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  menuLabel: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  menuArrow: {
    fontSize: 20,
    color: '#CBD5E1',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  appInfo: {
    marginTop: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  appVersion: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
});

