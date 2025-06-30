import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  tertiary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#3B5284',
  secondary: '#5BA8A0',
  accent: '#CBE54E',
  tertiary: '#94B447',
  background: '#F0F8FF',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#5D6E1E',
  border: '#E5E7EB',
};

const darkColors: ThemeColors = {
  primary: '#5BA8A0',
  secondary: '#CBE54E',
  accent: '#94B447',
  tertiary: '#3B5284',
  background: '#1F2937',
  surface: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#4B5563',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};