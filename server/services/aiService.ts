
import OpenAI from 'openai';
import { storage } from '../storage';
import type { Article } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  factCheckScore: number;
  trendingScore: number;
  isVerified: boolean;
  summary?: string;
  keywords?: string[];
}

class AIService {
  private isApiAvailable = true;
  private lastApiCheck = 0;
  private readonly API_CHECK_INTERVAL = 300000; // 5 minutes

  private async checkApiAvailability(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastApiCheck < this.API_CHECK_INTERVAL) {
      return this.isApiAvailable;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      });
      this.isApiAvailable = true;
      this.lastApiCheck = now;
      return true;
    } catch (error) {
      this.isApiAvailable = false;
      this.lastApiCheck = now;
      console.warn('OpenAI API not available, using fallback analysis');
      return false;
    }
  }

  async analyzeArticle(article: Article): Promise<AnalysisResult> {
    const startTime = Date.now();
    const isApiAvailable = await this.checkApiAvailability();

    if (!isApiAvailable || !process.env.OPENAI_API_KEY) {
      return this.fallbackAnalysis(article, startTime);
    }
    
    try {
      const analysisPrompt = `
        Please analyze the following news article and provide a comprehensive analysis in JSON format:

        Title: ${article.title}
        Content: ${article.content || 'No content available'}
        Author: ${article.author || 'Unknown'}
        Category: ${article.category || 'General'}

        Please provide analysis with the following JSON structure:
        {
          "sentiment": "positive" | "negative" | "neutral",
          "sentimentScore": number between 0 and 1,
          "factCheckScore": number between 0 and 1 (1 being most reliable),
          "trendingScore": number between 0 and 1 (1 being most trending),
          "isVerified": boolean,
          "summary": "brief summary in 1-2 sentences",
          "keywords": ["keyword1", "keyword2", "keyword3"]
        }

        Analysis criteria:
        - Sentiment: Overall emotional tone of the article
        - Fact Check Score: Reliability based on source credibility, fact consistency, and verifiable claims
        - Trending Score: Relevance to current events and public interest
        - Verified: Whether the information appears factual and from credible sources
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a news analysis expert. Analyze articles and provide accurate JSON responses with sentiment analysis, fact-checking scores, and trending assessments."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1024,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      const duration = Date.now() - startTime;

      // Log the analysis
      await storage.createAiAnalysisLog({
        articleId: article.id,
        analysisType: 'comprehensive',
        input: `${article.title}\n${article.content}`,
        output: analysis,
        model: "gpt-4o",
        duration,
        status: 'completed',
      });

      return {
        sentiment: analysis.sentiment || 'neutral',
        sentimentScore: Math.max(0, Math.min(1, analysis.sentimentScore || 0.5)),
        factCheckScore: Math.max(0, Math.min(1, analysis.factCheckScore || 0.5)),
        trendingScore: Math.max(0, Math.min(1, analysis.trendingScore || 0.5)),
        isVerified: Boolean(analysis.isVerified),
        summary: analysis.summary || this.generateFallbackSummary(article),
        keywords: analysis.keywords || this.extractBasicKeywords(article),
      };

    } catch (error) {
      console.error('OpenAI API error, using fallback analysis:', error);
      return this.fallbackAnalysis(article, startTime);
    }
  }

  private fallbackAnalysis(article: Article, startTime: number): AnalysisResult {
    const duration = Date.now() - startTime;
    
    // Advanced fallback analysis based on content
    const sentiment = this.analyzeBasicSentiment(article.title + ' ' + (article.content || ''));
    const trendingScore = this.calculateTrendingScore(article);
    const factCheckScore = this.calculateFactCheckScore(article);
    
    // Log fallback analysis
    storage.createAiAnalysisLog({
      articleId: article.id,
      analysisType: 'fallback',
      input: `${article.title}\n${article.content}`,
      output: { sentiment, trendingScore, factCheckScore, method: 'fallback' },
      model: "fallback",
      duration,
      status: 'completed',
    }).catch(console.error);

    return {
      sentiment,
      sentimentScore: sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? 0.3 : 0.5,
      factCheckScore,
      trendingScore,
      isVerified: factCheckScore > 0.6,
      summary: this.generateFallbackSummary(article),
      keywords: this.extractBasicKeywords(article),
    };
  }

  private analyzeBasicSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['успех', 'победа', 'рост', 'улучшение', 'breakthrough', 'success', 'growth', 'innovation', 'achievement'];
    const negativeWords = ['проблема', 'ошибка', 'падение', 'кризис', 'crisis', 'problem', 'decline', 'failure', 'issue'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateTrendingScore(article: Article): number {
    let score = 0.5; // base score
    
    // Recent articles score higher
    const hoursSincePublished = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSincePublished < 24) score += 0.3;
    else if (hoursSincePublished < 48) score += 0.2;
    else if (hoursSincePublished < 72) score += 0.1;
    
    // Category-based scoring
    const trendingCategories = ['AI & Technology', 'Finance & Crypto', 'Startups'];
    if (trendingCategories.includes(article.category || '')) score += 0.2;
    
    return Math.min(1, score);
  }

  private calculateFactCheckScore(article: Article): number {
    let score = 0.5; // base score
    
    // Known reliable sources get higher scores
    const reliableSources = ['techcrunch', 'mit technology review', 'reuters', 'bbc'];
    const sourceName = (article.author || '').toLowerCase();
    if (reliableSources.some(source => sourceName.includes(source))) {
      score += 0.3;
    }
    
    // Articles with proper content get higher scores
    if (article.content && article.content.length > 500) score += 0.1;
    if (article.url && article.url.includes('https://')) score += 0.1;
    
    return Math.min(1, score);
  }

  private generateFallbackSummary(article: Article): string {
    const content = article.content || article.title;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) return article.title;
    if (sentences.length === 1) return sentences[0].trim();
    
    // Return first two sentences as summary
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }

  private extractBasicKeywords(article: Article): string[] {
    const text = `${article.title} ${article.content || ''}`.toLowerCase();
    const keywords = new Set<string>();
    
    // Technical keywords
    const techKeywords = ['ai', 'artificial intelligence', 'blockchain', 'crypto', 'startup', 'technology', 'innovation'];
    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) keywords.add(keyword);
    });
    
    // Extract words longer than 5 characters
    const words = text.match(/\b\w{6,}\b/g) || [];
    words.slice(0, 5).forEach(word => keywords.add(word));
    
    return Array.from(keywords).slice(0, 8);
  }

  async generateNftMetadata(article: Article): Promise<{
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
    external_url: string;
  }> {
    const isApiAvailable = await this.checkApiAvailability();
    
    if (!isApiAvailable || !process.env.OPENAI_API_KEY) {
      return this.generateFallbackNftMetadata(article);
    }

    try {
      const prompt = `
        Generate NFT metadata for a news article with the following details:
        Title: ${article.title}
        Content: ${article.content || 'No content available'}
        Category: ${article.category}
        Author: ${article.author}

        Please provide metadata in JSON format:
        {
          "name": "unique NFT name based on article",
          "description": "engaging description for NFT collectors",
          "image": "placeholder_image_url",
          "attributes": [
            {"trait_type": "Category", "value": "category"},
            {"trait_type": "Author", "value": "author"},
            {"trait_type": "Sentiment", "value": "positive/negative/neutral"},
            {"trait_type": "Trending Score", "value": number}
          ],
          "external_url": "article_url"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an NFT metadata specialist. Create engaging and valuable NFT metadata for news articles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const metadata = JSON.parse(response.choices[0].message.content || '{}');
      
      return this.enhanceNftMetadata(metadata, article);
    } catch (error) {
      console.warn('OpenAI API error for NFT metadata, using fallback:', error);
      return this.generateFallbackNftMetadata(article);
    }
  }

  private generateFallbackNftMetadata(article: Article) {
    const sentiments = ['positive', 'negative', 'neutral'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const trendingScore = Math.floor(Math.random() * 100);
    
    const titleWords = article.title.split(' ').filter(word => word.length > 3);
    const nftName = `${titleWords.slice(0, 3).join(' ')} NFT #${Math.floor(Math.random() * 10000)}`;
    
    const description = `Exclusive digital collectible representing "${article.title}". This NFT captures a significant moment in ${article.category} news from ${article.author}. Verified and authenticated by AutoNews.AI platform.`;
    
    return this.enhanceNftMetadata({
      name: nftName,
      description: description,
      image: `https://via.placeholder.com/400x400/4f46e5/white?text=${encodeURIComponent(article.category || 'News')}+NFT`,
      attributes: [
        { trait_type: "Sentiment", value: sentiment },
        { trait_type: "Trending Score", value: trendingScore },
      ]
    }, article);
  }

  private enhanceNftMetadata(metadata: any, article: Article) {
    return {
      name: metadata.name || `News NFT: ${article.title.substring(0, 50)}...`,
      description: metadata.description || `Exclusive NFT based on the news article: ${article.title}`,
      image: metadata.image || `https://via.placeholder.com/400x400/4f46e5/white?text=${encodeURIComponent(article.category || 'News')}+NFT`,
      attributes: [
        { trait_type: "Category", value: article.category || "General" },
        { trait_type: "Author", value: article.author || "Unknown" },
        { trait_type: "Source", value: "AutoNews.AI" },
        { trait_type: "Article ID", value: article.id },
        { trait_type: "Publication Date", value: new Date(article.publishedAt).toISOString().split('T')[0] },
        { trait_type: "Rarity", value: this.calculateRarity(article) },
        ...(metadata.attributes || [])
      ],
      external_url: article.url || "",
    };
  }

  private calculateRarity(article: Article): string {
    const hoursSincePublished = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursSincePublished < 1) return "Legendary";
    if (hoursSincePublished < 6) return "Epic";
    if (hoursSincePublished < 24) return "Rare";
    return "Common";
  }

  async recordMetric(name: string, value: number, metadata?: any): Promise<void> {
    try {
      await storage.recordSystemMetric({
        metricName: name,
        value: value.toFixed(4),
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          apiStatus: this.isApiAvailable ? 'available' : 'fallback'
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }
}

export const aiService = new AIService();
