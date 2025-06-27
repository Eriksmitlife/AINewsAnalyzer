
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1e293b',
      accent: '#f59e0b'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      text: '#f1f5f9',
      accent: '#fbbf24'
    }
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      background: '#f0f9ff',
      text: '#0c4a6e',
      accent: '#06b6d4'
    }
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Vibrant cyberpunk style',
    colors: {
      primary: '#00ff88',
      secondary: '#ff0080',
      background: '#0a0a0a',
      text: '#ffffff',
      accent: '#ffff00'
    }
  }
];

class ThemeService {
  private currentTheme: Theme = THEMES[0];
  private subscribers: (() => void)[] = [];

  constructor() {
    this.loadTheme();
  }

  private loadTheme() {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme) {
        const theme = THEMES.find(t => t.id === savedTheme);
        if (theme) {
          this.currentTheme = theme;
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    this.applyTheme();
  }

  private applyTheme() {
    const root = document.documentElement;
    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(themeId: string) {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      this.currentTheme = theme;
      this.applyTheme();
      try {
        localStorage.setItem('app-theme', themeId);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
      this.notify();
    }
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }
}

export const themeService = new ThemeService();

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (themeId: string) => void;
}>({
  theme: THEMES[0],
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(themeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setThemeState(themeService.getCurrentTheme());
    });

    return unsubscribe;
  }, []);

  const setTheme = (themeId: string) => {
    themeService.setTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
