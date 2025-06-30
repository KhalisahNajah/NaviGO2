import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // If auth is already initialized, get the existing instance
  console.log('Auth already initialized, using existing instance');
  auth = getAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;