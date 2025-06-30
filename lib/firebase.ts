import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBvyaXoKe_ghnK0vVoYD34kmlliJFzUoEc",
  authDomain: "maptogo-9518d.firebaseapp.com",
  projectId: "maptogo-9518d",
  storageBucket: "maptogo-9518d.firebasestorage.app",
  messagingSenderId: "201263013926",
  appId: "1:201263013926:web:3939d2ea055a249532c6e7",
  measurementId: "G-0089LCZZ8G"
};

console.log(`🔥 Firebase: Initializing for ${Platform.OS}`);

// Initialize Firebase app (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with simplified approach for SDK 53
let auth;

try {
  // Use getAuth for all platforms in Expo managed workflow
  auth = getAuth(app);
  console.log(`✅ Firebase Auth initialized successfully for ${Platform.OS}`);
} catch (error: any) {
  console.error('❌ Firebase Auth initialization failed:', error.message);
  
  // Simple retry mechanism
  try {
    // Wait a moment and try again
    setTimeout(() => {
      auth = getAuth(app);
      console.log(`✅ Firebase Auth retry successful for ${Platform.OS}`);
    }, 100);
  } catch (retryError: any) {
    console.error('❌ Firebase Auth retry failed:', retryError.message);
    throw new Error(`Failed to initialize Firebase Auth: ${retryError.message}`);
  }
}

// Initialize other Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase services initialized successfully');

// Export auth and app
export { auth, app };
export default app;