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

const firebaseConfig = {
  apiKey: "AIzaSyBvyaXoKe_ghnK0vVoYD34kmlliJFzUoEc",
  authDomain: "maptogo-9518d.firebaseapp.com",
  projectId: "maptogo-9518d",
  storageBucket: "maptogo-9518d.firebasestorage.app",
  messagingSenderId: "201263013926",
  appId: "1:201263013926:web:3939d2ea055a249532c6e7",
  measurementId: "G-0089LCZZ8G"
};

// Initialize Firebase app (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with proper platform-specific logic
let auth;

if (Platform.OS === 'web') {
  // For web, use getAuth
  auth = getAuth(app);
  console.log('Firebase Auth initialized for web');
} else {
  // For React Native, use initializeAuth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('Firebase Auth initialized for React Native with AsyncStorage persistence');
  } catch (error: any) {
    // If auth is already initialized, get the existing instance
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
      console.log('Firebase Auth already initialized, using existing instance');
    } else {
      console.error('Error initializing Firebase Auth:', error);
      throw error;
    }
  }
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Export auth and app
export { auth, app };

// Add connection state logging
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Firebase Auth: User is signed in:', user.email);
  } else {
    console.log('Firebase Auth: User is signed out');
  }
});

export default app;