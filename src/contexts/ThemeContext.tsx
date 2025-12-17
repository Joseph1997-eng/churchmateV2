import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
}

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    colors: ThemeColors;
}

const lightColors: ThemeColors = {
    primary: '#6366F1',
    secondary: '#EC4899',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
};

const darkColors: ThemeColors = {
    primary: '#818CF8',
    secondary: '#F472B6',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    success: '#34D399',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemTheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    // Determine actual theme based on mode
    const theme: Theme = themeMode === 'system'
        ? (systemTheme === 'dark' ? 'dark' : 'light')
        : themeMode;

    const colors = theme === 'dark' ? darkColors : lightColors;

    // Load saved preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                setThemeModeState(saved as ThemeMode);
            }
        } catch (error) {
            console.error('Load theme preference error:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            setThemeModeState(mode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            console.log(`Theme mode set to: ${mode}`);
        } catch (error) {
            console.error('Save theme preference error:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
