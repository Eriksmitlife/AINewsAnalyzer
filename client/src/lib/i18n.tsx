
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface Translations {
  [key: string]: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  translations: Translations;
}

const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    translations: {
      'nav.dashboard': 'Dashboard',
      'nav.news': 'News',
      'nav.nft': 'NFT Marketplace',
      'nav.trading': 'Trading',
      'nav.portfolio': 'Portfolio',
      'nav.analytics': 'Analytics',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.save': 'Save',
      'common.cancel': 'Cancel'
    }
  },
  {
    code: 'ru',
    name: 'Русский',
    translations: {
      'nav.dashboard': 'Панель управления',
      'nav.news': 'Новости',
      'nav.nft': 'NFT Маркетплейс',
      'nav.trading': 'Торговля',
      'nav.portfolio': 'Портфолио',
      'nav.analytics': 'Аналитика',
      'common.loading': 'Загрузка...',
      'common.error': 'Ошибка',
      'common.save': 'Сохранить',
      'common.cancel': 'Отмена'
    }
  }
];

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
