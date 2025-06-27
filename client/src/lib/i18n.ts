
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      news: 'News',
      exchange: 'Exchange',
      trading: 'Trading',
      auctions: 'Live Auctions',
      portfolio: 'Portfolio',
      analytics: 'Analytics',
      profile: 'Profile',
    },
    dashboard: {
      title: 'AI-Powered News Dashboard',
      subtitle: 'Real-time news analysis with blockchain integration',
      totalArticles: 'Total Articles',
      totalNfts: 'NFTs Created',
      totalUsers: 'Active Users',
      systemHealth: 'System Health',
      quickActions: 'Quick Actions',
      generateNft: 'Generate NFT',
      runAnalysis: 'Run AI Analysis',
      collectNews: 'Collect News',
      trendingNews: 'Trending News',
      recentNfts: 'Recent NFTs',
      aiInsights: 'AI Insights',
    },
    news: {
      title: 'News Feed',
      subtitle: 'Stay updated with AI-analyzed news from trusted sources',
      search: 'Search news, articles, or topics...',
      category: 'Category',
      sortBy: 'Sort by',
      filter: 'Filter',
      clear: 'Clear',
      noArticles: 'No articles found',
      tryAdjusting: 'Try adjusting your search criteria or check back later for new content.',
      trending: 'Trending Now',
      categories: 'Categories',
      recentActivity: 'Recent Activity',
    },
    themes: {
      light: 'Light',
      dark: 'Dark',
      neon: 'Neon',
    },
    seo: {
      metaTitle: 'AutoNews.AI - AI-Powered News Analysis & NFT Trading Platform',
      metaDescription: 'Get real-time AI analysis of breaking news. Trade news-based NFTs on our secure platform. Stay ahead with intelligent news insights.',
      keywords: 'AI news, news analysis, NFT trading, blockchain news, artificial intelligence, real-time news, crypto news, tech news',
    },
  },
  ru: {
    nav: {
      dashboard: 'Панель управления',
      news: 'Новости',
      exchange: 'Биржа',
      trading: 'Трейдинг',
      auctions: 'Живые аукционы',
      portfolio: 'Портфолио',
      analytics: 'Аналитика',
      profile: 'Профиль',
    },
    dashboard: {
      title: 'Панель новостей с ИИ',
      subtitle: 'Анализ новостей в реальном времени с блокчейн интеграцией',
      totalArticles: 'Всего статей',
      totalNfts: 'Создано NFT',
      totalUsers: 'Активных пользователей',
      systemHealth: 'Состояние системы',
      quickActions: 'Быстрые действия',
      generateNft: 'Создать NFT',
      runAnalysis: 'Запустить ИИ анализ',
      collectNews: 'Собрать новости',
      trendingNews: 'Трендовые новости',
      recentNfts: 'Недавние NFT',
      aiInsights: 'ИИ аналитика',
    },
    news: {
      title: 'Лента новостей',
      subtitle: 'Оставайтесь в курсе с новостями, проанализированными ИИ',
      search: 'Поиск новостей, статей или тем...',
      category: 'Категория',
      sortBy: 'Сортировать по',
      filter: 'Фильтр',
      clear: 'Очистить',
      noArticles: 'Статьи не найдены',
      tryAdjusting: 'Попробуйте изменить критерии поиска или проверьте позже.',
      trending: 'В тренде сейчас',
      categories: 'Категории',
      recentActivity: 'Недавняя активность',
    },
    themes: {
      light: 'Светлая',
      dark: 'Тёмная',
      neon: 'Неон',
    },
    seo: {
      metaTitle: 'AutoNews.AI - Платформа ИИ анализа новостей и торговли NFT',
      metaDescription: 'Получайте ИИ анализ последних новостей в реальном времени. Торгуйте NFT на основе новостей на нашей безопасной платформе.',
      keywords: 'ИИ новости, анализ новостей, торговля NFT, блокчейн новости, искусственный интеллект, новости реального времени, крипто новости',
    },
  },
  // Добавим остальные языки...
  es: {
    nav: {
      dashboard: 'Panel de Control',
      news: 'Noticias',
      exchange: 'Intercambio',
      trading: 'Trading',
      auctions: 'Subastas en Vivo',
      portfolio: 'Portafolio',
      analytics: 'Analíticas',
      profile: 'Perfil',
    },
    seo: {
      metaTitle: 'AutoNews.AI - Plataforma de Análisis de Noticias IA y Trading NFT',
      metaDescription: 'Obtén análisis de IA de noticias de última hora en tiempo real. Comercia NFTs basados en noticias en nuestra plataforma segura.',
      keywords: 'noticias IA, análisis noticias, trading NFT, noticias blockchain, inteligencia artificial, noticias tiempo real',
    },
  },
};

export type TranslationKey = keyof typeof translations.en;

class I18nService {
  private currentLanguage: string = 'en';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
    this.listeners.forEach(listener => listener());
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const i18n = new I18nService();

// React Provider Component
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const I18nContext = createContext<{
  language: string;
  translate: (key: string) => string;
  setLanguage: (language: string) => void;
}>({
  language: 'en',
  translate: (key: string) => key,
  setLanguage: () => {},
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(i18n.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      setLanguageState(i18n.getCurrentLanguage());
    });

    return unsubscribe;
  }, []);

  const setLanguage = (lang: string) => {
    i18n.setLanguage(lang);
  };

  const translate = (key: string) => {
    return i18n.translate(key);
  };

  return (
    <I18nContext.Provider value={{ language, translate, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}
