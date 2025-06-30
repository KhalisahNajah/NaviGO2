import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface UserContextType {
  profile: any;
  getCurrencySymbol: () => string;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  getCurrencySymbol: () => '$',
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { userProfile, getCurrencySymbol } = useAuth();

  return (
    <UserContext.Provider value={{
      profile: userProfile,
      getCurrencySymbol,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};