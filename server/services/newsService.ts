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

class NewsService {
  private isCollecting = false;
  private collectionInterval: NodeJS.Timeout | null = null;

  async startNewsCollection(): Promise<void> {
    if (this.isCollecting) {
      console.log('News collection already in progress');
      return;
    }

    this.isCollecting = true;
    console.log('Starting news collection...');

    try {
      await this.collectFromAllSources();
    } catch (error) {
      console.error('Error in news collection:', error);
    } finally {
      this.isCollecting = false;
    }
  }

  async scheduleNewsCollection(): Promise<void> {
    // Run news collection every 15 minutes
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    this.collectionInterval = setInterval(async () => {
      if (!this.isCollecting) {
        await this.startNewsCollection();
      }
    }, 15 * 60 * 1000); // 15 minutes

    console.log('News collection scheduled every 15 minutes');
  }

  private async collectFromAllSources(): Promise<void> {
    const sources = await storage.getNewsSources(true);
    console.log(`Collecting from ${sources.length} active news sources`);

    const collectionPromises = sources.map(source => 
      this.collectFromSource(source).catch(error => {
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
    });
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
          const existingArticle = await this.checkIfArticleExists(item.link);
          if (existingArticle) continue;

          const articleData: InsertArticle = {
            title: item.title,
            content: item.content || item.description || '',
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
      return [];
    }
  }

  private async fetchFromRSS(rssUrl: string): Promise<RSSItem[]> {
    try {
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'AutoNews.AI/1.0 (News Aggregator)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const items = this.parseRSSXML(xmlText);
      
      return items.slice(0, 20); // Limit to 20 latest articles per source
    } catch (error) {
      console.error(`RSS fetch failed for ${rssUrl}:`, error);
      return [];
    }
  }

  private parseRSSXML(xmlText: string): RSSItem[] {
    const items: RSSItem[] = [];
    
    try {
      // Simple XML parsing for RSS items
      const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi);
      
      if (!itemMatches) return items;

      for (const itemXml of itemMatches) {
        const title = this.extractXMLContent(itemXml, 'title');
        const link = this.extractXMLContent(itemXml, 'link');
        const description = this.extractXMLContent(itemXml, 'description');
        const pubDate = this.extractXMLContent(itemXml, 'pubDate');
        const author = this.extractXMLContent(itemXml, 'author') || 
                     this.extractXMLContent(itemXml, 'dc:creator');
        const category = this.extractXMLContent(itemXml, 'category');
        const content = this.extractXMLContent(itemXml, 'content:encoded') ||
                       this.extractXMLContent(itemXml, 'content');

        if (title && link) {
          items.push({
            title: this.cleanText(title),
            link: this.cleanText(link),
            description: description ? this.cleanText(description) : undefined,
            pubDate: pubDate ? this.cleanText(pubDate) : undefined,
            author: author ? this.cleanText(author) : undefined,
            category: category ? this.cleanText(category) : undefined,
            content: content ? this.cleanText(content) : undefined,
          });
        }
      }
    } catch (error) {
      console.error('RSS XML parsing error:', error);
    }

    return items;
  }

  private extractXMLContent(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
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
      .trim();
  }

  private async fetchFromWebsite(url: string): Promise<RSSItem[]> {
    // For now, return empty array for direct website scraping
    // This would require more sophisticated HTML parsing
    console.log(`Direct website scraping not implemented for ${url}`);
    return [];
  }

  private async checkIfArticleExists(url: string): Promise<boolean> {
    try {
      const articles = await storage.getArticles({ limit: 1, search: url });
      return articles.some(article => article.url === url);
    } catch (error) {
      return false;
    }
  }

  private categorizeArticle(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    const categories = {
      'AI & Technology': ['ai', 'artificial intelligence', 'machine learning', 'technology', 'tech', 'software', 'algorithm', 'neural', 'automation'],
      'Finance & Crypto': ['bitcoin', 'crypto', 'blockchain', 'finance', 'financial', 'investment', 'stock', 'market', 'trading', 'ethereum'],
      'Startups': ['startup', 'entrepreneur', 'venture', 'funding', 'vc', 'investment round', 'seed', 'series a'],
      'Science': ['science', 'research', 'study', 'discovery', 'scientific', 'experiment', 'breakthrough'],
      'Business': ['business', 'company', 'corporate', 'enterprise', 'industry', 'ceo', 'economy'],
      'Health': ['health', 'medical', 'healthcare', 'medicine', 'treatment', 'disease', 'therapy'],
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
        name: 'Habr',
        url: 'https://habr.com',
        rssUrl: 'https://habr.com/rss/hub/artificial_intelligence/',
        category: 'AI & Technology',
        language: 'ru',
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
}

export const newsService = new NewsService();

// Initialize default sources and start collection on import
newsService.initializeDefaultSources().then(() => {
  newsService.scheduleNewsCollection();
});
