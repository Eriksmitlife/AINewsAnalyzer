
export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  effects: {
    shadows: boolean;
    animations: boolean;
    gradients: boolean;
    blur: boolean;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Professional Light',
    description: 'Clean and modern light theme for professional use',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      border: '#e2e8f0',
    },
    effects: {
      shadows: true,
      animations: true,
      gradients: false,
      blur: false,
    },
  },
  {
    id: 'dark',
    name: 'Premium Dark',
    description: 'Sleek dark theme with premium feel',
    colors: {
      primary: '#6366f1',
      secondary: '#94a3b8',
      accent: '#10b981',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      border: '#334155',
    },
    effects: {
      shadows: true,
      animations: true,
      gradients: true,
      blur: true,
    },
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    description: 'Futuristic neon theme with vibrant colors',
    colors: {
      primary: '#ff0080',
      secondary: '#00ff80',
      accent: '#0080ff',
      background: '#000012',
      surface: '#1a0033',
      text: '#ffffff',
      border: '#ff0080',
    },
    effects: {
      shadows: true,
      animations: true,
      gradients: true,
      blur: true,
    },
  },
];

class ThemeService {
  private currentTheme: string = 'light';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme();
  }

  setTheme(themeId: string) {
    this.currentTheme = themeId;
    localStorage.setItem('theme', themeId);
    this.applyTheme();
    this.listeners.forEach(listener => listener());
  }

  getCurrentTheme(): Theme {
    return THEMES.find(t => t.id === this.currentTheme) || THEMES[0];
  }

  private applyTheme() {
    const theme = this.getCurrentTheme();
    const root = document.documentElement;
    
    // Apply dark class for Tailwind CSS
    if (theme.id === 'dark' || theme.id === 'neon') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Remove old theme classes but preserve dark class and other important classes
    const currentClasses = root.className.split(' ');
    const filteredClasses = currentClasses.filter(cls => !cls.startsWith('theme-'));
    root.className = filteredClasses.join(' ');
    
    // Add new theme class
    root.classList.add(`theme-${theme.id}`);
    
    // Ensure dark class is present if needed
    if (theme.id === 'dark' || theme.id === 'neon') {
      if (!root.classList.contains('dark')) {
        root.classList.add('dark');
      }
    }

    // Apply meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.primary);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const themeService = new ThemeService();

// React Provider Component
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

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

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, setTheme } },
    children
  );
}
