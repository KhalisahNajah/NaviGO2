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

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener...');
    
    // Simplified auth state listener for SDK 53
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthProvider: Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      try {
        setUser(user);
        
        if (user) {
          // Fetch user profile from Firestore
          console.log('AuthProvider: Fetching user profile for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            const profile = {
              ...profileData,
              createdAt: profileData.createdAt?.toDate?.() || new Date(),
              updatedAt: profileData.updatedAt?.toDate?.() || new Date(),
            } as UserProfile;
            console.log('AuthProvider: User profile loaded:', profile.name);
            setUserProfile(profile);
          } else {
            console.log('AuthProvider: No user profile found in Firestore');
            setUserProfile(null);
          }
        } else {
          console.log('AuthProvider: User signed out, clearing profile');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('AuthProvider: Error in auth state change handler:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Attempting to sign in user:', email);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider: Sign in successful:', result.user.email);
    } catch (error: any) {
      console.error('AuthProvider: Sign in error:', error);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('AuthProvider: Attempting to create user:', email);
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName: name });
      
      // Create user profile in Firestore
      const newUserProfile: UserProfile = {
        uid: user.uid,
        name,
        email: user.email || '',
        profilePicture: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        currency: 'USD',
        region: 'North America',
        country: 'United States',
        preferredFuelType: 'Regular',
        navigationSettings: defaultNavigationSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('AuthProvider: Creating user profile in Firestore');
      await setDoc(doc(db, 'users', user.uid), {
        ...newUserProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('AuthProvider: User created successfully:', user.email);
      setUserProfile(newUserProfile);
    } catch (error: any) {
      console.error('AuthProvider: Sign up error:', error);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthProvider: Signing out user');
      setLoading(true);
      await signOut(auth);
      console.log('AuthProvider: Sign out successful');
    } catch (error: any) {
      console.error('AuthProvider: Sign out error:', error);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    
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
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
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
    if (!userProfile) return 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    
    const { months, years } = getUserTenure();
    
    // 5+ years - Blue (Highway Hero)
    if (years >= 5) {
      return 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    }
    // 1+ years - Purple (Mini Racer)
    else if (years >= 1) {
      return 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    }
    // 5+ months - Yellow (Tiny Tires)
    else if (months >= 5) {
      return 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
    }
    // Default - Yellow for new users
    else {
      return 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';
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