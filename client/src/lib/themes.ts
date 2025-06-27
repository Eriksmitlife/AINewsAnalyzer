
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
    success: string;
    warning: string;
    error: string;
  };
  effects: {
    shadows: boolean;
    animations: boolean;
    gradients: boolean;
    blur: boolean;
    neon: boolean;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Professional Light',
    description: 'Чистый и современный светлый дизайн',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    effects: {
      shadows: true,
      animations: true,
      gradients: false,
      blur: false,
      neon: false,
    },
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    description: 'Футуристический неоновый дизайн с яркими эффектами',
    colors: {
      primary: '#ff0080',
      secondary: '#00ff80',
      accent: '#0080ff',
      background: '#000012',
      surface: '#1a0033',
      text: '#ffffff',
      border: '#ff0080',
      success: '#00ff80',
      warning: '#ffff00',
      error: '#ff4040',
    },
    effects: {
      shadows: true,
      animations: true,
      gradients: true,
      blur: true,
      neon: true,
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
    
    // Apply theme class
    root.classList.remove('theme-light', 'theme-neon');
    root.classList.add(`theme-${theme.id}`);
    
    // Apply dark class for neon theme
    if (theme.id === 'neon') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply theme effects
    if (theme.effects.neon) {
      root.classList.add('neon-effects');
    } else {
      root.classList.remove('neon-effects');
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
