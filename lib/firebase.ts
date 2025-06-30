import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBvyaXoKe_ghnK0vVoYD34kmlliJFzUoEc",
  authDomain: "maptogo-9518d.firebaseapp.com",
  projectId: "maptogo-9518d",
  storageBucket: "maptogo-9518d.appspot.com", // Fixed the typo here
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

// Initialize Firebase services with error handling
let auth, db, storage;

try {
  // Initialize Auth
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
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

export { auth, db, storage, app };
export default app;