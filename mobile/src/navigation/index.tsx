import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import DesignResultsScreen from '../screens/DesignResultsScreen';
import ARPreviewScreen from '../screens/ARPreviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LoginScreen from '../screens/LoginScreen';

// Types
export type RootStackParamList = {
  Main: undefined;
  Camera: undefined;
  Analysis: { imageUri: string; analysisId: string };
  Preferences: { analysisData: any };
  DesignResults: { designId: string; preferences: any };
  ARPreview: { furnitureList: any[] };
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      {name === 'Home' && <View style={[styles.homeIcon, focused && styles.iconActive]} />}
      {name === 'History' && <View style={[styles.historyIcon, focused && styles.iconActive]} />}
      {name === 'Profile' && <View style={[styles.profileIcon, focused && styles.iconActive]} />}
    </View>
  );
};

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: '首页' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ tabBarLabel: '历史' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
}

// Main Navigation
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="DesignResults" component={DesignResultsScreen} />
        <Stack.Screen 
          name="ARPreview" 
          component={ARPreviewScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  tabIconFocused: {},
  homeIcon: {
    width: 20,
    height: 18,
    borderWidth: 2,
    borderColor: '#94a3b8',
    borderRadius: 2,
    borderTopWidth: 8,
  },
  historyIcon: {
    width: 18,
    height: 20,
    borderWidth: 2,
    borderColor: '#94a3b8',
    borderRadius: 3,
  },
  profileIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94a3b8',
  },
  iconActive: {
    borderColor: '#0066FF',
  },
});

