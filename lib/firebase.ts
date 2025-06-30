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
  storageBucket: "maptogo-9518d.appspot.com",
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
  throw new Error(`Firebase app initialization failed: ${error}`);
}

// Initialize Firebase services with enhanced platform-specific auth handling
let auth, db, storage;

try {
  // Platform-specific auth initialization with better error handling
  if (Platform.OS === 'web') {
    // Use standard getAuth for web
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized for web');
  } else {
    // Use initializeAuth with AsyncStorage for native platforms
    console.log('🔧 Initializing Firebase Auth for native platform with AsyncStorage...');
    
    try {
      // Check if AsyncStorage is available
      if (!AsyncStorage) {
        throw new Error('AsyncStorage is not available');
      }
      
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      console.log('✅ Firebase Auth initialized for native with AsyncStorage persistence');
    } catch (error: any) {
      console.log('⚠️ Auth initialization error:', error.code, error.message);
      
      // If auth is already initialized, get the existing instance
      if (error.code === 'auth/already-initialized') {
        console.log('🔄 Auth already initialized, getting existing instance...');
        auth = getAuth(app);
        console.log('✅ Firebase Auth existing instance retrieved');
      } else if (error.message?.includes('AsyncStorage')) {
        // Fallback to web auth if AsyncStorage fails
        console.log('🔄 AsyncStorage failed, falling back to web auth...');
        auth = getAuth(app);
        console.log('✅ Firebase Auth initialized with web fallback');
      } else {
        console.error('❌ Critical auth initialization error:', error);
        throw error;
      }
    }
  }
  
  // Verify auth instance is valid
  if (!auth) {
    throw new Error('Firebase Auth instance is null or undefined');
  }
  
  // Test auth instance
  console.log('🔍 Testing auth instance...');
  console.log('Auth app:', auth.app?.name || 'undefined');
  console.log('Auth config:', auth.config ? 'present' : 'missing');
  
  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  // Initialize Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized');
  
} catch (error) {
  console.error('❌ Firebase services initialization failed:', error);
  throw new Error(`Firebase services initialization failed: ${error}`);
}

// Final verification
console.log('🔍 Final Firebase verification:');
console.log('- App:', app ? '✅' : '❌');
console.log('- Auth:', auth ? '✅' : '❌');
console.log('- Firestore:', db ? '✅' : '❌');
console.log('- Storage:', storage ? '✅' : '❌');

if (!auth) {
  const errorMessage = `Firebase Auth failed to initialize on ${Platform.OS}`;
  console.error('❌', errorMessage);
  throw new Error(errorMessage);
}

console.log('✅ All Firebase services initialized successfully');
console.log('🔥 Auth instance type:', typeof auth);
console.log('🔥 Auth instance:', auth.constructor?.name || 'unknown');

export { auth, db, storage, app };
export default app;