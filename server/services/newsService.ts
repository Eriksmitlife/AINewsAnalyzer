
import { storage } from '../storage';
import { aiService } from './aiService';
import type { InsertArticle, NewsSource } from '@shared/schema';

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  author?: string;
  category?: string;
  content?: string;
}

interface AdContent {
  type: 'banner' | 'sponsored' | 'native';
  content: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  targeting?: string[];
}

class NewsService {
  private isCollecting = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private errorCount = 0;
  private lastSuccessfulCollection = new Date();
  private readonly MAX_ERRORS_BEFORE_RESTART = 5;
  private readonly COLLECTION_INTERVAL = 5 * 60 * 1000; // 5 minutes for 24/7 operation

  async startNewsCollection(): Promise<void> {
    if (this.isCollecting) {
      console.log('News collection already in progress');
      return;
    }

    this.isCollecting = true;
    console.log('Starting 24/7 news collection...');

    try {
      await this.collectFromAllSources();
      this.errorCount = 0; // Reset error count on success
      this.lastSuccessfulCollection = new Date();
    } catch (error) {
      this.errorCount++;
      console.error(`Error in news collection (${this.errorCount}/${this.MAX_ERRORS_BEFORE_RESTART}):`, error);
      
      if (this.errorCount >= this.MAX_ERRORS_BEFORE_RESTART) {
        console.log('Too many errors, restarting collection system...');
        await this.restartCollectionSystem();
      }
    } finally {
      this.isCollecting = false;
    }
  }

  async scheduleNewsCollection(): Promise<void> {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    this.collectionInterval = setInterval(async () => {
      if (!this.isCollecting) {
        await this.startNewsCollection();
      }
    }, this.COLLECTION_INTERVAL);

    console.log(`24/7 News collection scheduled every ${this.COLLECTION_INTERVAL / 60000} minutes`);
    
    // Start health monitoring
    this.startHealthMonitoring();
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      const timeSinceLastSuccess = Date.now() - this.lastSuccessfulCollection.getTime();
      const maxAllowedGap = 30 * 60 * 1000; // 30 minutes
      
      if (timeSinceLastSuccess > maxAllowedGap) {
        console.warn('Health check failed: No successful collection in 30 minutes, restarting...');
        this.restartCollectionSystem();
      }
    }, 10 * 60 * 1000); // Check every 10 minutes
  }

  private async restartCollectionSystem(): Promise<void> {
    console.log('Restarting news collection system...');
    this.stopNewsCollection();
    this.errorCount = 0;
    
    // Wait 30 seconds before restart
    setTimeout(() => {
      this.scheduleNewsCollection();
    }, 30000);
  }

  private async collectFromAllSources(): Promise<void> {
    const sources = await storage.getNewsSources(true);
    console.log(`Collecting from ${sources.length} active news sources`);

    const collectionPromises = sources.map(source => 
      this.collectFromSourceWithRetry(source).catch(error => {
        console.error(`Failed to collect from ${source.name}:`, error);
        return [];
      })
    );

    const results = await Promise.all(collectionPromises);
    const totalArticles = results.reduce((sum, articles) => sum + articles.length, 0);
    
    console.log(`Collected ${totalArticles} new articles`);
    
    // Record collection metrics
    await aiService.recordMetric('news_collection_count', totalArticles, {
      sources: sources.length,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount,
    });

    // Generate ads for new articles
    if (totalArticles > 0) {
      await this.generateAdsForArticles(results.flat());
    }
  }

  private async collectFromSourceWithRetry(source: NewsSource, maxRetries = 3): Promise<any[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.collectFromSource(source);
      } catch (error) {
        console.warn(`Attempt ${attempt}/${maxRetries} failed for ${source.name}:`, error);
        if (attempt === maxRetries) {
          // Mark source as problematic but don't throw
          await this.markSourceProblematic(source, error);
          return [];
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
    return [];
  }

  private async markSourceProblematic(source: NewsSource, error: any): Promise<void> {
    try {
      await storage.updateNewsSource(source.id, {
        lastCrawled: new Date(),
        // Could add error tracking fields here
      });
      
      await aiService.recordMetric('source_error', 1, {
        sourceName: source.name,
        sourceId: source.id,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to mark source as problematic:', logError);
    }
  }

  private async collectFromSource(source: NewsSource): Promise<any[]> {
    try {
      let articles: RSSItem[] = [];
      
      if (source.rssUrl) {
        articles = await this.fetchFromRSS(source.rssUrl);
      } else {
        articles = await this.fetchFromWebsite(source.url);
      }

      const newArticles = [];
      
      for (const item of articles) {
        try {
          // Enhanced duplicate check
          const existingArticle = await this.checkIfArticleExistsEnhanced(item.link, item.title);
          if (existingArticle) continue;

          const articleData: InsertArticle = {
            title: this.cleanAndValidateTitle(item.title),
            content: this.enhanceContentWithAds(item.content || item.description || ''),
            summary: item.description || '',
            url: item.link,
            author: item.author || source.name,
            category: this.categorizeArticle(item.title, item.description || ''),
            sourceId: source.id,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          };

          const article = await storage.createArticle(articleData);
          
          // Analyze article with AI (async, don't wait)
          this.analyzeArticleAsync(article);
          
          newArticles.push(article);
        } catch (error) {
          // Skip duplicate articles silently
          if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
            continue;
          }
          console.error(`Error processing article "${item.title}":`, error);
        }
      }

      // Update source last crawled time
      await storage.updateNewsSource(source.id, {
        lastCrawled: new Date(),
      });

      return newArticles;
    } catch (error) {
      console.error(`Error collecting from source ${source.name}:`, error);
      throw error; // Re-throw for retry mechanism
    }
  }

  private cleanAndValidateTitle(title: string): string {
    const cleaned = this.cleanText(title);
    
    // Ensure title is not too long
    if (cleaned.length > 200) {
      return cleaned.substring(0, 197) + '...';
    }
    
    // Ensure title is not empty
    if (!cleaned.trim()) {
      return 'Untitled Article';
    }
    
    return cleaned;
  }

  private enhanceContentWithAds(content: string): string {
    if (!content) return content;
    
    const ads = this.generateContextualAds(content);
    
    // Insert ads at strategic positions
    const paragraphs = content.split('\n\n');
    if (paragraphs.length > 3) {
      // Insert ad after second paragraph
      paragraphs.splice(2, 0, ads.native);
      
      // Insert banner ad at the end
      paragraphs.push(ads.banner);
    }
    
    return paragraphs.join('\n\n');
  }

  private generateContextualAds(content: string): { banner: string; native: string; sidebar: string } {
    const lowerContent = content.toLowerCase();
    
    // Tech-focused ads
    if (lowerContent.includes('ai') || lowerContent.includes('technology')) {
      return {
        banner: '\n[AD] 🚀 Революционные AI решения для вашего бизнеса - узнайте больше на TechSolutions.ai',
        native: '\n💡 Интересно узнать больше об AI? Посетите наш курс "AI для всех" - скидка 30% по промокоду NEWS30',
        sidebar: '🤖 AI Консультации - Бесплатная консультация для стартапов'
      };
    }
    
    // Crypto/Finance ads
    if (lowerContent.includes('crypto') || lowerContent.includes('bitcoin') || lowerContent.includes('finance')) {
      return {
        banner: '\n[AD] 💰 Торгуйте криптовалютой на надежной бирже CryptoTrade - регистрация за 2 минуты',
        native: '\n📈 Хотите изучить криптотрейдинг? Наш курс поможет вам начать - первый урок бесплатно',
        sidebar: '💎 Криpto-портфель - Управляйте инвестициями профессионально'
      };
    }
    
    // Default general ads
    return {
      banner: '\n[AD] 🌟 AutoNews.AI - Ваш источник актуальных новостей с AI-анализом. Подписывайтесь!',
      native: '\n📰 Нравятся качественные новости? Поддержите независимую журналистику - подписка от 99₽/месяц',
      sidebar: '🎯 Реклама здесь - Разместите вашу рекламу и достигните целевой аудитории'
    };
  }

  private async checkIfArticleExistsEnhanced(url: string, title: string): Promise<boolean> {
    try {
      // Check by URL
      const articlesByUrl = await storage.getArticles({ limit: 1, search: url });
      if (articlesByUrl.some(article => article.url === url)) {
        return true;
      }
      
      // Check by similar title (prevent near-duplicates)
      const similarTitle = title.substring(0, 50);
      const articlesByTitle = await storage.getArticles({ limit: 5, search: similarTitle });
      return articlesByTitle.some(article => 
        this.calculateTitleSimilarity(article.title, title) > 0.8
      );
    } catch (error) {
      console.error('Error checking article existence:', error);
      return false;
    }
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(/\s+/);
    const words2 = title2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  private async fetchFromRSS(rssUrl: string): Promise<RSSItem[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'AutoNews.AI/2.0 (News Aggregator; +https://autonews.ai)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const items = this.parseRSSXML(xmlText);
      
      return items.slice(0, 50); // Increased limit for 24/7 operation
    } catch (error) {
      console.error(`RSS fetch failed for ${rssUrl}:`, error);
      throw error; // Re-throw for retry mechanism
    }
  }

  private parseRSSXML(xmlText: string): RSSItem[] {
    const items: RSSItem[] = [];
    
    try {
      // Enhanced XML parsing for RSS items with better error handling
      const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || 
                         xmlText.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi); // Support Atom feeds
      
      if (!itemMatches) {
        console.warn('No RSS items found in feed');
        return items;
      }

      for (const itemXml of itemMatches) {
        try {
          const title = this.extractXMLContent(itemXml, 'title');
          const link = this.extractXMLContent(itemXml, 'link') || 
                      this.extractXMLAttribute(itemXml, 'link', 'href'); // Support Atom links
          
          if (!title || !link) continue;

          const description = this.extractXMLContent(itemXml, 'description') ||
                            this.extractXMLContent(itemXml, 'summary');
          const pubDate = this.extractXMLContent(itemXml, 'pubDate') ||
                         this.extractXMLContent(itemXml, 'published') ||
                         this.extractXMLContent(itemXml, 'updated');
          const author = this.extractXMLContent(itemXml, 'author') || 
                        this.extractXMLContent(itemXml, 'dc:creator') ||
                        this.extractXMLContent(itemXml, 'name');
          const category = this.extractXMLContent(itemXml, 'category');
          const content = this.extractXMLContent(itemXml, 'content:encoded') ||
                         this.extractXMLContent(itemXml, 'content');

          items.push({
            title: this.cleanText(title),
            link: this.cleanText(link),
            description: description ? this.cleanText(description) : undefined,
            pubDate: pubDate ? this.cleanText(pubDate) : undefined,
            author: author ? this.cleanText(author) : undefined,
            category: category ? this.cleanText(category) : undefined,
            content: content ? this.cleanText(content) : undefined,
          });
        } catch (itemError) {
          console.warn('Error parsing RSS item:', itemError);
          continue; // Skip problematic items
        }
      }
    } catch (error) {
      console.error('RSS XML parsing error:', error);
      throw error;
    }

    return items;
  }

  private extractXMLContent(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractXMLAttribute(xml: string, tagName: string, attributeName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*${attributeName}=["']([^"']*?)["'][^>]*>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async fetchFromWebsite(url: string): Promise<RSSItem[]> {
    console.log(`Direct website scraping not implemented for ${url}`);
    return [];
  }

  private categorizeArticle(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    const categories = {
      'AI & Technology': ['ai', 'artificial intelligence', 'machine learning', 'technology', 'tech', 'software', 'algorithm', 'neural', 'automation', 'робот', 'искусственный интеллект'],
      'Finance & Crypto': ['bitcoin', 'crypto', 'blockchain', 'finance', 'financial', 'investment', 'stock', 'market', 'trading', 'ethereum', 'биткоин', 'крипто', 'финансы'],
      'Startups': ['startup', 'entrepreneur', 'venture', 'funding', 'vc', 'investment round', 'seed', 'series a', 'стартап', 'предприниматель'],
      'Science': ['science', 'research', 'study', 'discovery', 'scientific', 'experiment', 'breakthrough', 'наука', 'исследование'],
      'Business': ['business', 'company', 'corporate', 'enterprise', 'industry', 'ceo', 'economy', 'бизнес', 'компания'],
      'Health': ['health', 'medical', 'healthcare', 'medicine', 'treatment', 'disease', 'therapy', 'здоровье', 'медицина'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'General';
  }

  private async analyzeArticleAsync(article: any): Promise<void> {
    try {
      const analysis = await aiService.analyzeArticle(article);
      
      await storage.updateArticle(article.id, {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore.toString(),
        factCheckScore: analysis.factCheckScore.toString(),
        trendingScore: analysis.trendingScore.toString(),
        isVerified: analysis.isVerified,
        summary: analysis.summary,
      });
    } catch (error) {
      console.error(`Error analyzing article ${article.id}:`, error);
    }
  }

  private async generateAdsForArticles(articles: any[]): Promise<void> {
    try {
      for (const article of articles) {
        const adContent = this.generateContextualAds(article.content || article.title);
        
        // Store ad metrics
        await aiService.recordMetric('ad_generated', 1, {
          articleId: article.id,
          adType: 'contextual',
          category: article.category,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error generating ads:', error);
    }
  }

  async initializeDefaultSources(): Promise<void> {
    const defaultSources = [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com',
        rssUrl: 'https://techcrunch.com/feed/',
        category: 'AI & Technology',
        language: 'en',
      },
      {
        name: 'Hacker News',
        url: 'https://news.ycombinator.com',
        rssUrl: 'https://hnrss.org/frontpage',
        category: 'AI & Technology',
        language: 'en',
      },
      {
        name: 'MIT Technology Review',
        url: 'https://www.technologyreview.com',
        rssUrl: 'https://www.technologyreview.com/feed/',
        category: 'AI & Technology',
        language: 'en',
      },
      {
        name: 'VentureBeat',
        url: 'https://venturebeat.com',
        rssUrl: 'https://venturebeat.com/feed/',
        category: 'AI & Technology',
        language: 'en',
      },
      {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com',
        rssUrl: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        category: 'Finance & Crypto',
        language: 'en',
      },
      {
        name: 'BBC Technology',
        url: 'https://www.bbc.com/news/technology',
        rssUrl: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
        category: 'AI & Technology',
        language: 'en',
      },
      {
        name: 'Reuters Technology',
        url: 'https://www.reuters.com/technology/',
        rssUrl: 'https://www.reutersagency.com/feed/?best-topics=tech',
        category: 'AI & Technology',
        language: 'en',
      },
      // Добавим русскоязычные источники
      {
        name: 'Хабр',
        url: 'https://habr.com',
        rssUrl: 'https://habr.com/rss/all/',
        category: 'AI & Technology',
        language: 'ru',
      },
      {
        name: 'RBC Tech',
        url: 'https://www.rbc.ru/technology_and_media/',
        rssUrl: 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss',
        category: 'AI & Technology',
        language: 'ru',
      },
    ];

    for (const sourceData of defaultSources) {
      try {
        const existingSources = await storage.getNewsSources(false);
        const exists = existingSources.some(s => s.name === sourceData.name);
        
        if (!exists) {
          await storage.createNewsSource(sourceData);
          console.log(`Added news source: ${sourceData.name}`);
        }
      } catch (error) {
        console.error(`Error adding source ${sourceData.name}:`, error);
      }
    }
  }

  stopNewsCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    console.log('News collection stopped');
  }

  // Health check endpoint
  getHealthStatus() {
    return {
      isCollecting: this.isCollecting,
      errorCount: this.errorCount,
      lastSuccessfulCollection: this.lastSuccessfulCollection,
      collectionInterval: this.COLLECTION_INTERVAL,
      maxErrors: this.MAX_ERRORS_BEFORE_RESTART,
    };
  }
}

export const newsService = new NewsService();

// Initialize default sources and start 24/7 collection
newsService.initializeDefaultSources().then(() => {
  newsService.scheduleNewsCollection();
  console.log('24/7 News collection system initialized successfully');
}).catch(error => {
  console.error('Failed to initialize news collection:', error);
  // Retry initialization after 60 seconds
  setTimeout(() => {
    newsService.initializeDefaultSources().then(() => {
      newsService.scheduleNewsCollection();
    });
  }, 60000);
});
