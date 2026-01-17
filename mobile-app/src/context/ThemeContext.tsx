import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { theme as defaultTheme } from '../theme';
import { colors as defaultColors, darkColors, lightColors } from '../theme/colors';

type ThemeMode = 'dark' | 'light';
type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'zinc' | 'light-blue' | 'light-green' | 'light-purple' | 'light-orange';

interface ThemeContextType {
  mode: ThemeMode;
  accentColor: AccentColor;
  theme: typeof defaultTheme;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentColors: Record<AccentColor, string> = {
  zinc: '#18181b', // Default
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
  'light-blue': '#0ea5e9',
  'light-green': '#10b981',
  'light-purple': '#8b5cf6',
  'light-orange': '#f97316',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('zinc');
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  useEffect(() => {
    // Load saved theme preferences
    const loadTheme = async () => {
      const savedMode = await SecureStore.getItemAsync('themeMode');
      const savedAccent = await SecureStore.getItemAsync('accentColor');
      
      if (savedMode) setModeState(savedMode as ThemeMode);
      if (savedAccent) setAccentColorState(savedAccent as AccentColor);
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Dynamically update theme object when choices change
    const baseColors = mode === 'dark' ? { ...defaultColors, ...darkColors } : { ...defaultColors, ...lightColors };
    
    let primaryColor = baseColors.primary;
    let background = baseColors.background;
    let surface = baseColors.surface;

    if (mode === 'dark') {
      if (accentColor !== 'zinc' && !accentColor.startsWith('light-')) {
        primaryColor = accentColors[accentColor] || primaryColor;
      }
    } else {
      // Light Themes
      const themesMap: Record<string, any> = {
        'light-blue': { primary: '#0ea5e9', background: '#f8fafc', surface: '#ffffff' },
        'light-green': { primary: '#10b981', background: '#f0fdf4', surface: '#ffffff' },
        'light-purple': { primary: '#8b5cf6', background: '#f5f3ff', surface: '#ffffff' },
        'light-orange': { primary: '#f97316', background: '#fff7ed', surface: '#ffffff' },
      };

      const lightTheme = themesMap[accentColor];

      if (lightTheme) {
        primaryColor = lightTheme.primary;
        background = lightTheme.background;
        surface = lightTheme.surface;
      } else {
        // Fallback or default light
        primaryColor = '#3b82f6';
      }
    }
    
    setCurrentTheme({
      ...defaultTheme,
      colors: {
        ...baseColors,
        primary: primaryColor,
        background,
        surface,
      },
    });

    // Save preferences
    SecureStore.setItemAsync('themeMode', mode);
    SecureStore.setItemAsync('accentColor', accentColor);
  }, [mode, accentColor]);

  const setMode = (newMode: ThemeMode) => setModeState(newMode);
  const setAccentColor = (newColor: AccentColor) => setAccentColorState(newColor);

  return (
    <ThemeContext.Provider value={{ mode, accentColor, theme: currentTheme, setMode, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
