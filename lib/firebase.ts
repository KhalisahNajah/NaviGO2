import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBvyaXoKe_ghnK0vVoYD34kmlliJFzUoEc",
  authDomain: "maptogo-9518d.firebaseapp.com",
  projectId: "maptogo-9518d",
  storageBucket: "maptogo-9518d.appspot.com",  // <-- fix ".app" to ".com"
  messagingSenderId: "201263013926",
  appId: "1:201263013926:web:3939d2ea055a249532c6e7",
  measurementId: "G-0089LCZZ8G"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;


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

console.log(`🔥 Firebase: Initializing for ${Platform.OS} with App ID: ${firebaseConfig.appId}`);

// Initialize Firebase app (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with enhanced error handling for SDK 53
let auth;

try {
  if (Platform.OS === 'web') {
    // Web platform - use standard getAuth
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized for web');
  } else {
    // React Native platforms - use initializeAuth with AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log(`✅ Firebase Auth initialized for ${Platform.OS} with AsyncStorage persistence`);
  }
} catch (error: any) {
  console.log('⚠️ Firebase Auth initialization error, attempting fallback:', error.message);
  
  // Enhanced error handling for SDK 53
  if (
    error.code === 'auth/already-initialized' || 
    error.message?.includes('already initialized') ||
    error.message?.includes('already exists') ||
    error.message?.includes('duplicate-app')
  ) {
    try {
      auth = getAuth(app);
      console.log(`✅ Firebase Auth fallback successful for ${Platform.OS}`);
    } catch (fallbackError: any) {
      console.error('❌ Firebase Auth fallback failed:', fallbackError.message);
      
      // Final fallback - wait and retry
      setTimeout(() => {
        try {
          auth = getAuth(app);
          console.log(`✅ Firebase Auth delayed fallback successful for ${Platform.OS}`);
        } catch (finalError: any) {
          console.error('❌ All Firebase Auth initialization attempts failed:', finalError.message);
          throw new Error(`Failed to initialize Firebase Auth: ${finalError.message}`);
        }
      }, 100);
    }
  } else {
    console.error('❌ Unexpected Firebase Auth error:', error.message);
    throw new Error(`Failed to initialize Firebase Auth: ${error.message}`);
  }
}

// Ensure auth is properly initialized
if (!auth) {
  console.warn('⚠️ Firebase Auth not immediately available, will retry...');
  // Create a promise that resolves when auth is available
  auth = new Promise((resolve) => {
    const checkAuth = () => {
      try {
        const authInstance = getAuth(app);
        resolve(authInstance);
      } catch (error) {
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
}

// Initialize other Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase services initialized successfully');

// Export auth and app
export { auth, app };
export default app;