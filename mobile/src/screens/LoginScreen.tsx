import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import type { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Lightning Icon Component
const LightningIcon = () => (
  <View style={iconStyles.lightning}>
    <View style={iconStyles.lightningTop} />
    <View style={iconStyles.lightningBottom} />
  </View>
);

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useLanguage();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert(
        t.error,
        language === 'zh' ? '请填写邮箱和密码' : 'Please enter email and password'
      );
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert(
        t.error,
        language === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email'
      );
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        t.error,
        language === 'zh' ? '密码至少6位' : 'Password must be at least 6 characters'
      );
      return false;
    }

    if (isRegister) {
      if (!name) {
        Alert.alert(
          t.error,
          language === 'zh' ? '请输入姓名' : 'Please enter your name'
        );
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert(
          t.error,
          language === 'zh' ? '两次密码不一致' : 'Passwords do not match'
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t.error,
        error.message || (language === 'zh' ? '操作失败，请重试' : 'Failed, please try again')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeIcon}>X</Text>
          </TouchableOpacity>
        </View>

        {/* Logo & Title */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <LightningIcon />
          </View>
          <Text style={styles.brandName}>SmartRoom AI</Text>
          <Text style={styles.subtitle}>
            {isRegister 
              ? (language === 'zh' ? '创建账号' : 'Create Account')
              : t.login_title}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {isRegister && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {language === 'zh' ? '姓名' : 'Name'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'zh' ? '请输入姓名' : 'Enter your name'}
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.login_email}</Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'zh' ? '请输入邮箱' : 'Enter your email'}
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.login_password}</Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'zh' ? '请输入密码' : 'Enter your password'}
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isRegister && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {language === 'zh' ? '确认密码' : 'Confirm Password'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'zh' ? '请再次输入密码' : 'Confirm your password'}
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}

          {!isRegister && (
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>{t.login_forgot}</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit} 
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#0066FF', '#0052CC']}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>
                  {isRegister ? t.login_register : t.login_submit}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Toggle Mode */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.toggleText}>
              {isRegister
                ? (language === 'zh' ? '已有账号？登录' : 'Already have an account? Login')
                : (language === 'zh' ? '没有账号？注册' : "Don't have an account? Register")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {language === 'zh' ? '或' : 'OR'}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.appleIcon} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const iconStyles = StyleSheet.create({
  lightning: {
    width: 24,
    height: 36,
    position: 'relative',
  },
  lightningTop: {
    position: 'absolute',
    top: 0,
    left: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{ skewX: '-10deg' }],
  },
  lightningBottom: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    transform: [{ skewX: '-10deg' }],
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 14,
    color: '#64748B',
  },
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#94A3B8',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appleIcon: {
    width: 18,
    height: 22,
    backgroundColor: '#000000',
    borderRadius: 4,
    marginRight: 8,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});
