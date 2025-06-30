import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBvyaXoKe_ghnK0vVoYD34kmlliJFzUoEc",
  authDomain: "maptogo-9518d.firebaseapp.com",
  projectId: "maptogo-9518d",
  storageBucket: "maptogo-9518d.appspot.com", // Fixed the typo
  messagingSenderId: "201263013926",
  appId: "1:201263013926:web:3939d2ea055a249532c6e7",
  measurementId: "G-0089LCZZ8G"
};

console.log(`🔥 Firebase: Initializing for ${Platform.OS}`);

// Initialize Firebase app with error handling
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Initialize Firebase services with platform-specific auth handling
let auth, db, storage;

try {
  // Platform-specific auth initialization
  if (Platform.OS === 'web') {
    // Use standard getAuth for web
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized for web');
  } else {
    // Use initializeAuth with AsyncStorage for native platforms
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      console.log('✅ Firebase Auth initialized for native with AsyncStorage persistence');
    } catch (error: any) {
      // If auth is already initialized, get the existing instance
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
        console.log('✅ Firebase Auth already initialized, using existing instance');
      } else {
        throw error;
      }
    }
  }
  
  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  // Initialize Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized');
  
} catch (error) {
  console.error('❌ Firebase services initialization failed:', error);
  throw error;
}

// Verify auth is properly initialized
if (!auth) {
  throw new Error('Firebase Auth failed to initialize');
}

console.log('✅ All Firebase services initialized successfully');
console.log('🔥 Auth instance:', auth);

export { auth, db, storage, app };
export default app;