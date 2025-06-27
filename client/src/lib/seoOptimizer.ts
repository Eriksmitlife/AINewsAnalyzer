
import { i18n } from './i18n';

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  canonicalUrl: string;
  jsonLd: any;
}

class SEOOptimizer {
  private static instance: SEOOptimizer;

  public static getInstance(): SEOOptimizer {
    if (!SEOOptimizer.instance) {
      SEOOptimizer.instance = new SEOOptimizer();
    }
    return SEOOptimizer.instance;
  }

  generateNewsMetadata(article: any): SEOMetadata {
    const lang = i18n.getCurrentLanguage();
    const baseUrl = window.location.origin;
    
    // Оптимизированный заголовок для поисковых систем
    const optimizedTitle = this.optimizeTitle(article.title, lang);
    
    // SEO-оптимизированное описание
    const optimizedDescription = this.optimizeDescription(article.summary || article.content, lang);
    
    // Ключевые слова на основе контента и категории
    const keywords = this.extractKeywords(article, lang);
    
    // JSON-LD структурированные данные
    const jsonLd = this.generateNewsJsonLd(article, baseUrl);
    
    return {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords,
      ogTitle: optimizedTitle,
      ogDescription: optimizedDescription,
      ogImage: article.imageUrl || `${baseUrl}/api/og-image/${article.id}`,
      twitterTitle: this.truncateText(optimizedTitle, 70),
      twitterDescription: this.truncateText(optimizedDescription, 200),
      canonicalUrl: `${baseUrl}/news/${article.id}`,
      jsonLd,
    };
  }

  private optimizeTitle(title: string, lang: string): string {
    // Удаляем лишние символы и оптимизируем для SEO
    let optimized = title
      .replace(/[^\w\s\-—–.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Добавляем мощные слова для привлечения внимания
    const powerWords = {
      en: ['Breaking', 'Exclusive', 'Latest', 'Urgent', 'Revolutionary', 'Game-Changing'],
      ru: ['Срочно', 'Эксклюзив', 'Последние', 'Революционный', 'Прорыв', 'Сенсация'],
      es: ['Último', 'Exclusivo', 'Urgente', 'Revolucionario', 'Exclusiva'],
    };

    const words = powerWords[lang as keyof typeof powerWords] || powerWords.en;
    
    // Проверяем, содержит ли заголовок уже мощные слова
    const hasPowerWord = words.some(word => 
      optimized.toLowerCase().includes(word.toLowerCase())
    );

    if (!hasPowerWord && optimized.length < 50) {
      const randomPowerWord = words[Math.floor(Math.random() * words.length)];
      optimized = `${randomPowerWord}: ${optimized}`;
    }

    // Ограничиваем длину для поисковых систем
    if (optimized.length > 60) {
      optimized = optimized.substring(0, 57) + '...';
    }

    return optimized;
  }

  private optimizeDescription(content: string, lang: string): string {
    if (!content) return '';
    
    // Очищаем контент от HTML и лишних символов
    let description = content
      .replace(/<[^>]*>/g, '')
      .replace(/\[AD\].*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Извлекаем первые предложения
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let optimized = sentences.slice(0, 2).join('. ');

    // Добавляем призыв к действию
    const cta = {
      en: 'Read full analysis with AI insights.',
      ru: 'Читайте полный анализ с ИИ.',
      es: 'Lee el análisis completo con IA.',
    };

    if (optimized.length < 120) {
      optimized += ` ${cta[lang as keyof typeof cta] || cta.en}`;
    }

    // Ограничиваем длину для meta description
    if (optimized.length > 160) {
      optimized = optimized.substring(0, 157) + '...';
    }

    return optimized;
  }

  private extractKeywords(article: any, lang: string): string[] {
    const keywords = new Set<string>();
    
    // Базовые ключевые слова
    const baseKeywords = {
      en: ['news', 'ai analysis', 'breaking news', 'latest news', 'nft trading'],
      ru: ['новости', 'ии анализ', 'последние новости', 'торговля nft', 'аналитика'],
      es: ['noticias', 'análisis ia', 'últimas noticias', 'trading nft'],
    };

    baseKeywords[lang as keyof typeof baseKeywords]?.forEach(kw => keywords.add(kw));

    // Ключевые слова из категории
    if (article.category) {
      keywords.add(article.category.toLowerCase());
    }

    // Извлекаем ключевые слова из заголовка и контента
    const text = `${article.title} ${article.content || ''}`.toLowerCase();
    const importantWords = text.match(/\b[a-zA-Zа-яё]{4,}\b/g) || [];
    
    // Добавляем наиболее частые слова
    const wordFreq = new Map();
    importantWords.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word]) => keywords.add(word));

    return Array.from(keywords).slice(0, 15);
  }

  private generateNewsJsonLd(article: any, baseUrl: string): any {
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.summary || this.truncateText(article.content, 200),
      "image": article.imageUrl || `${baseUrl}/api/og-image/${article.id}`,
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "author": {
        "@type": "Organization",
        "name": article.author || "AutoNews.AI",
        "url": baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "AutoNews.AI",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "url": `${baseUrl}/news/${article.id}`,
      "mainEntityOfPage": `${baseUrl}/news/${article.id}`,
      "articleSection": article.category,
      "keywords": this.extractKeywords(article, 'en').join(', '),
      "about": {
        "@type": "Thing",
        "name": article.category
      }
    };
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  updatePageMetadata(metadata: SEOMetadata): void {
    // Update title
    document.title = metadata.title;

    // Update meta tags
    this.updateMetaTag('description', metadata.description);
    this.updateMetaTag('keywords', metadata.keywords.join(', '));
    
    // Update Open Graph tags
    this.updateMetaTag('og:title', metadata.ogTitle, 'property');
    this.updateMetaTag('og:description', metadata.ogDescription, 'property');
    this.updateMetaTag('og:image', metadata.ogImage, 'property');
    this.updateMetaTag('og:url', metadata.canonicalUrl, 'property');
    this.updateMetaTag('og:type', 'article', 'property');

    // Update Twitter tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', metadata.twitterTitle);
    this.updateMetaTag('twitter:description', metadata.twitterDescription);
    this.updateMetaTag('twitter:image', metadata.ogImage);

    // Update canonical URL
    this.updateCanonicalUrl(metadata.canonicalUrl);

    // Update JSON-LD
    this.updateJsonLd(metadata.jsonLd);
  }

  private updateMetaTag(name: string, content: string, attribute: string = 'name'): void {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private updateCanonicalUrl(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  private updateJsonLd(data: any): void {
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}

export const seoOptimizer = SEOOptimizer.getInstance();
