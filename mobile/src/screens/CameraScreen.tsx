import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage } from '../lib/i18n';
import { useDesignStore } from '../store';
import { analysisApi } from '../lib/api';
import type { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useLanguage();
  const { setIsAnalyzing, setProgress, setCurrentAnalysis } = useDesignStore();
  
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const processImage = async (uri: string) => {
    try {
      setIsCapturing(true);
      setIsAnalyzing(true);
      setProgress(10);

      // 压缩和处理图片
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setProgress(20);

      // 上传到后端分析
      const uploadResult = await analysisApi.uploadImage(manipResult.uri);
      const analysisId = uploadResult.id;

      // 轮询获取分析结果
      let result = null;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const status = await analysisApi.getStatus(analysisId);
        
        if (status.status === 'completed') {
          result = status;
          break;
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Analysis failed');
        }
        
        attempts++;
        setProgress(20 + Math.min(attempts * 2.5, 70));
      }

      if (!result) {
        throw new Error('Analysis timeout');
      }

      setProgress(100);

      // 保存分析结果
      setCurrentAnalysis({
        id: analysisId,
        imageUri: manipResult.uri,
        roomType: result.result?.room_type || 'Unknown',
        estimatedSize: result.result?.estimated_size || 'N/A',
        currentStyle: result.result?.current_style || 'N/A',
        furniture: result.result?.furniture || [],
        issues: result.result?.issues || [],
      });

      // 导航到分析结果页面
      navigation.replace('Analysis', { 
        imageUri: manipResult.uri, 
        analysisId 
      });

    } catch (error) {
      console.error('Image processing error:', error);
      Alert.alert(
        t.error,
        language === 'zh' ? '图片处理失败，请重试' : 'Image processing failed. Please try again.',
        [{ text: t.retry, onPress: () => setIsCapturing(false) }]
      );
    } finally {
      setIsCapturing(false);
      setIsAnalyzing(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        await processImage(photo.uri);
      } catch (error) {
        console.error('Take picture error:', error);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const toggleFlash = () => {
    setFlash(current =>
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  const flipCamera = () => {
    setType(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>{t.camera_permission}</Text>
        <Text style={styles.permissionText}>{t.camera_permission_desc}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flash}
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.controlIcon}>X</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, flash === FlashMode.on && styles.controlButtonActive]}
            onPress={toggleFlash}
          >
            <Text style={styles.controlIcon}>Flash</Text>
          </TouchableOpacity>
        </View>

        {/* Hint Overlay */}
        <View style={styles.hintContainer}>
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>{t.camera_hint}</Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
            disabled={isCapturing}
          >
            <View style={styles.galleryIconBox} />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="#0066FF" size="small" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          {/* Flip Button */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={flipCamera}
            disabled={isCapturing}
          >
            <Text style={styles.flipIcon}>Flip</Text>
          </TouchableOpacity>
        </View>
      </Camera>

      {/* Loading Overlay */}
      {isCapturing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>{t.analysis_loading}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  hintContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIconBox: {
    width: 24,
    height: 20,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 3,
  },
  controlButtonActive: {
    backgroundColor: '#0066FF',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    fontSize: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
});

