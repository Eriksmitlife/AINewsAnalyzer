
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface Translations {
  [key: string]: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  translations: Translations;
}

const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    translations: {
      'nav.dashboard': 'Dashboard',
      'nav.news': 'News',
      'nav.nft': 'NFT Marketplace',
      'nav.exchange': 'Exchange',
      'nav.trading': 'Trading',
      'nav.auctions': 'Live Auctions',
      'nav.portfolio': 'Portfolio',
      'nav.analytics': 'Analytics',
      'nav.systemHealth': 'System Health',
      'nav.profile': 'Profile',
      'themes.light': 'Light',
      'themes.dark': 'Dark',
      'themes.blue': 'Ocean Blue',
      'themes.neon': 'Neon',
      'selectLanguage': 'Select Language',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.save': 'Save',
      'common.cancel': 'Cancel'
    }
  },
  {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺',
    translations: {
      'nav.dashboard': 'Панель управления',
      'nav.news': 'Новости',
      'nav.nft': 'NFT Маркетплейс',
      'nav.exchange': 'Биржа',
      'nav.trading': 'Торговля',
      'nav.auctions': 'Аукционы',
      'nav.portfolio': 'Портфолио',
      'nav.analytics': 'Аналитика',
      'nav.systemHealth': 'Состояние системы',
      'nav.profile': 'Профиль',
      'themes.light': 'Светлая',
      'themes.dark': 'Темная',
      'themes.blue': 'Океан',
      'themes.neon': 'Неон',
      'selectLanguage': 'Выбрать язык',
      'common.loading': 'Загрузка...',
      'common.error': 'Ошибка',
      'common.save': 'Сохранить',
      'common.cancel': 'Отмена'
    }
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    translations: {
      'nav.dashboard': '仪表板',
      'nav.news': '新闻',
      'nav.nft': 'NFT市场',
      'nav.exchange': '交易所',
      'nav.trading': '交易',
      'nav.auctions': '实时拍卖',
      'nav.portfolio': '投资组合',
      'nav.analytics': '分析',
      'nav.systemHealth': '系统状态',
      'nav.profile': '个人资料',
      'themes.light': '浅色',
      'themes.dark': '深色',
      'themes.blue': '海洋蓝',
      'themes.neon': '霓虹',
      'selectLanguage': '选择语言',
      'common.loading': '加载中...',
      'common.error': '错误',
      'common.save': '保存',
      'common.cancel': '取消'
    }
  }
];

export const SUPPORTED_LANGUAGES = LANGUAGES;

class I18nService {
  private currentLanguage: string = 'en';
  private subscribers: (() => void)[] = [];

  constructor() {
    this.loadLanguage();
  }

  private loadLanguage() {
    try {
      const savedLanguage = localStorage.getItem('app-language');
      if (savedLanguage && LANGUAGES.find(l => l.code === savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(languageCode: string) {
    if (LANGUAGES.find(l => l.code === languageCode)) {
      this.currentLanguage = languageCode;
      try {
        localStorage.setItem('app-language', languageCode);
      } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
      }
      this.notify();
    }
  }

  translate(key: string): string {
    const language = LANGUAGES.find(l => l.code === this.currentLanguage);
    if (language && language.translations[key]) {
      return language.translations[key];
    }
    return key;
  }

  getAvailableLanguages(): LanguageConfig[] {
    return LANGUAGES;
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

export const i18n = new I18nService();

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
