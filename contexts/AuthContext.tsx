import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { router } from 'expo-router';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profilePicture: string;
  currency: string;
  region: string;
  country: string;
  preferredFuelType: string;
  navigationSettings: {
    avoidUnpavedRoads: boolean;
    avoidTolls: boolean;
    avoidHighways: boolean;
    voiceGuidance: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getCurrencySymbol: () => string;
  getAvatarImage: () => string;
  getUserTenure: () => { months: number; years: number; title: string };
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

const defaultNavigationSettings = {
  avoidUnpavedRoads: true,
  avoidTolls: false,
  avoidHighways: false,
  voiceGuidance: true,
  notifications: true,
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  resetPassword: async () => {},
  getCurrencySymbol: () => '$',
  getAvatarImage: () => '',
  getUserTenure: () => ({ months: 0, years: 0, title: 'New Driver' }),
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener...');
    
    // Enhanced auth verification
    if (!auth) {
      console.error('❌ AuthProvider: Firebase auth is not available');
      console.error('Auth object:', auth);
      console.error('Auth type:', typeof auth);
      setLoading(false);
      return;
    }

    console.log('✅ AuthProvider: Firebase auth is available');
    console.log('Auth instance:', auth.constructor?.name || 'unknown');
    console.log('Auth app:', auth.app?.name || 'undefined');
    
    // Set up auth state listener with enhanced error handling
    let unsubscribe: (() => void) | null = null;
    
    try {
      console.log('🔧 Setting up onAuthStateChanged listener...');
      
      unsubscribe = onAuthStateChanged(
        auth, 
        async (firebaseUser) => {
          console.log('🔄 AuthProvider: Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
          
          try {
            setUser(firebaseUser);
            
            if (firebaseUser && !isLoggingOut) {
              // Fetch user profile from Firestore
              console.log('📥 AuthProvider: Fetching user profile for:', firebaseUser.uid);
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const profileData = userDoc.data();
                const profile = {
                  ...profileData,
                  createdAt: profileData.createdAt?.toDate?.() || new Date(),
                  updatedAt: profileData.updatedAt?.toDate?.() || new Date(),
                } as UserProfile;
                console.log('✅ AuthProvider: User profile loaded:', profile.name);
                setUserProfile(profile);
              } else {
                console.log('⚠️ AuthProvider: No user profile found in Firestore');
                setUserProfile(null);
              }
            } else {
              console.log('👋 AuthProvider: User signed out or logging out, clearing profile');
              setUserProfile(null);
            }
          } catch (error) {
            console.error('❌ AuthProvider: Error in auth state change handler:', error);
            setUserProfile(null);
          } finally {
            if (!isLoggingOut) {
              setLoading(false);
            }
          }
        },
        (error) => {
          console.error('❌ AuthProvider: Auth state listener error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          setLoading(false);
        }
      );
      
      console.log('✅ Auth state listener set up successfully');
      
    } catch (error) {
      console.error('❌ AuthProvider: Failed to set up auth state listener:', error);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth state listener');
      if (unsubscribe) {
        try {
          unsubscribe();
          console.log('✅ Auth state listener cleaned up');
        } catch (error) {
          console.error('❌ Error cleaning up auth listener:', error);
        }
      }
    };
  }, [isLoggingOut]);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      const error = 'Firebase auth is not available';
      console.error('❌ SignIn:', error);
      throw new Error(error);
    }
    
    try {
      console.log('🔐 AuthProvider: Attempting to sign in user:', email);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ AuthProvider: Sign in successful:', result.user.email);
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign in error:', error);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) {
      const error = 'Firebase auth is not available';
      console.error('❌ SignUp:', error);
      throw new Error(error);
    }
    
    try {
      console.log('👤 AuthProvider: Attempting to create user:', email);
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName: name });
      
      // Create user profile in Firestore with new driver avatar
      const newUserProfile: UserProfile = {
        uid: user.uid,
        name,
        email: user.email || '',
        profilePicture: 'https://i.pinimg.com/736x/48/d6/d5/48d6d52393dae5dca0340c5cfd382477.jpg', // New Driver avatar
        currency: 'USD',
        region: 'North America',
        country: 'United States',
        preferredFuelType: 'Regular',
        navigationSettings: defaultNavigationSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('💾 AuthProvider: Creating user profile in Firestore');
      await setDoc(doc(db, 'users', user.uid), {
        ...newUserProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ AuthProvider: User created successfully:', user.email);
      setUserProfile(newUserProfile);
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign up error:', error);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    if (!auth) {
      const error = 'Firebase auth is not available';
      console.error('❌ Logout:', error);
      throw new Error(error);
    }
    
    try {
      console.log('👋 AuthProvider: Starting logout process');
      setIsLoggingOut(true);
      setLoading(true);
      
      // Clear user state immediately to prevent UI flicker
      console.log('🧹 AuthProvider: Clearing user state');
      setUser(null);
      setUserProfile(null);
      
      // Sign out from Firebase
      console.log('🔐 AuthProvider: Signing out from Firebase');
      await signOut(auth);
      console.log('✅ AuthProvider: Firebase sign out successful');
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('✅ AuthProvider: Logout process completed successfully');
      
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign out error:', error);
      
      // Even if Firebase sign out fails, clear local state
      console.log('🔄 AuthProvider: Forcing logout despite error');
      setUser(null);
      setUserProfile(null);
      
      throw new Error(error.message);
    } finally {
      setIsLoggingOut(false);
      setLoading(false);
      
      // Force navigation to sign-in page after logout completes
      console.log('🔄 AuthProvider: Redirecting to sign-in page');
      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 100);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      console.warn('⚠️ Cannot update profile: no user or userProfile');
      return;
    }
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date(),
      });
      setUserProfile(updatedProfile);
      console.log('✅ User profile updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      const error = 'Firebase auth is not available';
      console.error('❌ Reset Password:', error);
      throw new Error(error);
    }
    
    try {
      console.log('📧 Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email, {
        url: 'https://navigo-app.netlify.app/(auth)/sign-in', // Deep link back to your app
        handleCodeInApp: false, // Handle reset in email, not in app
      });
      console.log('✅ Password reset email sent successfully');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      
      // Provide more user-friendly error messages
      let userFriendlyMessage = error.message;
      
      if (error.code === 'auth/user-not-found') {
        userFriendlyMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        userFriendlyMessage = 'Too many password reset attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      throw new Error(userFriendlyMessage);
    }
  };

  const getCurrencySymbol = () => {
    if (!userProfile) return '$';
    return currencies.find(c => c.code === userProfile.currency)?.symbol || userProfile.currency;
  };

  const getUserTenure = () => {
    if (!userProfile) return { months: 0, years: 0, title: 'New Driver' };
    
    const now = new Date();
    const createdAt = userProfile.createdAt;
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(months / 12);
    
    let title = 'New Driver';
    if (years >= 5) {
      title = 'Highway Hero';
    } else if (years >= 1) {
      title = 'Mini Racer';
    } else if (months >= 5) {
      title = 'Tiny Tires';
    }
    
    return { months, years, title };
  };

  const getAvatarImage = () => {
    if (!userProfile) {
      // Default for new users
      return 'https://i.pinimg.com/736x/48/d6/d5/48d6d52393dae5dca0340c5cfd382477.jpg';
    }
    
    const { months, years } = getUserTenure();
    
    // 5+ years - Highway Hero
    if (years >= 5) {
      return 'https://i.pinimg.com/736x/79/bf/06/79bf068a19a32366822007ea60bb9e29.jpg';
    }
    // 1+ years - Mini Racer
    else if (years >= 1) {
      return 'https://i.pinimg.com/736x/f9/ba/9b/f9ba9be42dde39d8915d92f553177a0a.jpg';
    }
    // 5+ months - Tiny Tires
    else if (months >= 5) {
      return 'https://i.pinimg.com/736x/a4/f5/7c/a4f57c74f3ce84f7277e2d7051a918f8.jpg';
    }
    // New users (0-5 months) - New Driver
    else {
      return 'https://i.pinimg.com/736x/48/d6/d5/48d6d52393dae5dca0340c5cfd382477.jpg';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signIn,
      signUp,
      logout,
      updateUserProfile,
      resetPassword,
      getCurrencySymbol,
      getAvatarImage,
      getUserTenure,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};