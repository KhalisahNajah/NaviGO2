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
    console.log('Firebase Auth initialized for React Native with AsyncStorage persistence');
  }
} catch (error: any) {
  console.log('Firebase Auth initialization error, attempting fallback:', error.message);
  
  // Fallback: try getAuth regardless of platform
  try {
    auth = getAuth(app);
    console.log('Firebase Auth fallback successful');
  } catch (fallbackError: any) {
    console.error('Firebase Auth fallback also failed:', fallbackError);
    throw new Error(`Failed to initialize Firebase Auth: ${fallbackError.message}`);
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

// Set up auth state listener safely
let authListenerSetup = false;

const setupAuthListener = () => {
  if (authListenerSetup || !auth) return;
  
  try {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Firebase Auth: User is signed in:', user.email);
      } else {
        console.log('Firebase Auth: User is signed out');
      }
    });
    authListenerSetup = true;
    console.log('Firebase Auth state listener set up successfully');
  } catch (error) {
    console.error('Error setting up auth state listener:', error);
  }
};

// Set up the listener on next tick to ensure auth is fully ready
setTimeout(setupAuthListener, 100);

export default app;