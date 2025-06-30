import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get platform-specific app ID
const getAppId = () => {
  const firebaseConfig = Constants.expoConfig?.extra?.firebase;
  
  if (Platform.OS === 'ios') {
    return firebaseConfig?.appId?.ios || "1:201263013926:ios:9ed8e30e13ba113a32c6e7";
  } else if (Platform.OS === 'android') {
    return firebaseConfig?.appId?.android || "1:201263013926:android:80d070b384ed0fe732c6e7";
  } else {
    return firebaseConfig?.appId?.web || "1:201263013926:web:3939d2ea055a249532c6e7";
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyBvyaXoKe_ghnK0vVoYD34kmlliJFzUoEc",
  authDomain: "maptogo-9518d.firebaseapp.com",
  projectId: "maptogo-9518d",
  storageBucket: "maptogo-9518d.firebasestorage.app",
  messagingSenderId: "201263013926",
  appId: getAppId(),
  measurementId: "G-0089LCZZ8G"
};

console.log(`Firebase: Initializing for ${Platform.OS} with App ID: ${firebaseConfig.appId}`);

// Initialize Firebase app (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with proper error handling
let auth;

try {
  if (Platform.OS === 'web') {
    // For web, use getAuth
    auth = getAuth(app);
    console.log('Firebase Auth initialized for web');
  } else {
    // For React Native, try initializeAuth first
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log(`Firebase Auth initialized for ${Platform.OS} with AsyncStorage persistence`);
  }
} catch (error: any) {
  console.log('Firebase Auth initialization error, attempting fallback:', error.message);
  
  // Only attempt fallback if the error indicates auth is already initialized
  if (error.code === 'auth/already-initialized' || error.message?.includes('already initialized')) {
    try {
      auth = getAuth(app);
      console.log(`Firebase Auth fallback successful - using existing instance for ${Platform.OS}`);
    } catch (fallbackError: any) {
      console.error('Firebase Auth fallback also failed:', fallbackError);
      throw new Error(`Failed to initialize Firebase Auth: ${fallbackError.message}`);
    }
  } else {
    // For other errors, don't attempt fallback
    console.error('Firebase Auth initialization failed with unexpected error:', error);
    throw new Error(`Failed to initialize Firebase Auth: ${error.message}`);
  }
}

// Ensure auth is defined before proceeding
if (!auth) {
  throw new Error('Firebase Auth could not be initialized');
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Export auth and app
export { auth, app };

export default app;