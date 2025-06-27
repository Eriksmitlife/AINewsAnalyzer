
import { aiService } from './aiService';
import { storage } from '../storage';

interface MarketPrediction {
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: '1h' | '6h' | '24h' | '7d';
  factors: string[];
  predictedTrend: number; // -1 to 1
}

interface TrendingTopic {
  keyword: string;
  mentions: number;
  sentimentScore: number;
  velocityScore: number;
  influenceScore: number;
}

class MarketPredictionService {
  private predictionCache = new Map<string, MarketPrediction>();
  private trendingTopics: TrendingTopic[] = [];

  async generateMarketPredictions(): Promise<MarketPrediction[]> {
    const recentArticles = await storage.getArticles({ 
      limit: 100, 
      sortBy: 'publishedAt',
      timeRange: '24h' 
    });

    const categories = ['AI & Technology', 'Finance & Crypto', 'Startups', 'Business'];
    const predictions: MarketPrediction[] = [];

    for (const category of categories) {
      const categoryArticles = recentArticles.filter(a => a.category === category);
      if (categoryArticles.length === 0) continue;

      const prediction = await this.analyzeCategory(category, categoryArticles);
      predictions.push(prediction);
      this.predictionCache.set(category, prediction);
    }

    return predictions;
  }

  private async analyzeCategory(category: string, articles: any[]): Promise<MarketPrediction> {
    // Sentiment analysis
    const sentiments = articles.map(a => parseFloat(a.sentimentScore || '0.5'));
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;

    // Trending analysis
    const trendScores = articles.map(a => parseFloat(a.trendingScore || '0.5'));
    const avgTrending = trendScores.reduce((a, b) => a + b, 0) / trendScores.length;

    // Keyword extraction and analysis
    const allText = articles.map(a => `${a.title} ${a.content || ''}`).join(' ');
    const keywords = this.extractTrendingKeywords(allText);

    // Market signals detection
    const marketSignals = this.detectMarketSignals(articles);

    // AI-powered prediction
    const aiPrediction = await this.getAIPrediction(category, articles, marketSignals);

    return {
      category,
      sentiment: avgSentiment > 0.6 ? 'bullish' : avgSentiment < 0.4 ? 'bearish' : 'neutral',
      confidence: Math.min(0.95, avgTrending * 0.7 + marketSignals.length * 0.1),
      timeframe: '24h',
      factors: [...keywords.slice(0, 5), ...marketSignals],
      predictedTrend: (avgSentiment - 0.5) * 2 // Convert to -1 to 1 scale
    };
  }

  private extractTrendingKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private detectMarketSignals(articles: any[]): string[] {
    const signals: string[] = [];
    const signalPatterns = {
      'Major Investment': ['investment', 'funding', 'venture', 'series', 'million', 'billion'],
      'Partnership': ['partnership', 'collaboration', 'alliance', 'merger'],
      'Product Launch': ['launch', 'release', 'unveil', 'announce', 'debut'],
      'Regulatory News': ['regulation', 'law', 'policy', 'government', 'ban', 'approve'],
      'Technology Breakthrough': ['breakthrough', 'innovation', 'revolutionary', 'first', 'patent']
    };

    for (const [signal, keywords] of Object.entries(signalPatterns)) {
      const matches = articles.filter(article => {
        const text = `${article.title} ${article.content || ''}`.toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
      });

      if (matches.length >= 2) {
        signals.push(signal);
      }
    }

    return signals;
  }

  private async getAIPrediction(category: string, articles: any[], signals: string[]): Promise<any> {
    const prompt = `
    Analyze the following market data for ${category}:
    
    Recent Articles: ${articles.length}
    Market Signals: ${signals.join(', ')}
    
    Sample Headlines:
    ${articles.slice(0, 5).map(a => `- ${a.title}`).join('\n')}
    
    Provide a market prediction with:
    1. Short-term outlook (24h)
    2. Key factors driving the trend
    3. Risk assessment
    4. Confidence level (0-100%)
    
    Format as JSON with fields: outlook, factors, risks, confidence
    `;

    try {
      const response = await aiService.analyzeText(prompt);
      return JSON.parse(response);
    } catch (error) {
      return {
        outlook: 'neutral',
        factors: signals,
        risks: ['High volatility', 'Limited data'],
        confidence: 50
      };
    }
  }

  async identifyTrendingTopics(): Promise<TrendingTopic[]> {
    const recentArticles = await storage.getArticles({ 
      limit: 200, 
      timeRange: '6h' 
    });

    const topicMap = new Map<string, TrendingTopic>();

    // Analyze each article for trending topics
    recentArticles.forEach(article => {
      const keywords = this.extractTrendingKeywords(`${article.title} ${article.content || ''}`);
      const sentimentScore = parseFloat(article.sentimentScore || '0.5');
      const trendingScore = parseFloat(article.trendingScore || '0.5');

      keywords.forEach(keyword => {
        const existing = topicMap.get(keyword) || {
          keyword,
          mentions: 0,
          sentimentScore: 0,
          velocityScore: 0,
          influenceScore: 0
        };

        existing.mentions++;
        existing.sentimentScore = (existing.sentimentScore + sentimentScore) / 2;
        existing.velocityScore = Math.max(existing.velocityScore, trendingScore);
        existing.influenceScore = existing.mentions * existing.velocityScore;

        topicMap.set(keyword, existing);
      });
    });

    this.trendingTopics = Array.from(topicMap.values())
      .filter(topic => topic.mentions >= 3)
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 20);

    return this.trendingTopics;
  }

  getPredictions(): MarketPrediction[] {
    return Array.from(this.predictionCache.values());
  }

  getTrendingTopics(): TrendingTopic[] {
    return this.trendingTopics;
  }
}

export const marketPredictionService = new MarketPredictionService();
