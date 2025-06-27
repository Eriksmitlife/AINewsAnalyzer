
import { storage } from '../storage';
import { aiService } from './aiService';

interface UserPreferences {
  categories: string[];
  keywords: string[];
  sentimentPreference: 'positive' | 'negative' | 'neutral' | 'mixed';
  readingTime: 'short' | 'medium' | 'long';
  nftInterests: string[];
  priceRange: { min: number; max: number };
}

interface RecommendationScore {
  itemId: string;
  score: number;
  reasons: string[];
  type: 'article' | 'nft';
}

class RecommendationService {
  private userBehaviorCache = new Map<string, any>();

  async getPersonalizedRecommendations(
    userId: string, 
    type: 'articles' | 'nfts' = 'articles',
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    
    // Get user preferences and behavior
    const preferences = await this.getUserPreferences(userId);
    const behavior = await this.analyzeUserBehavior(userId);
    
    // Get candidate items
    const candidates = type === 'articles' 
      ? await this.getCandidateArticles(preferences)
      : await this.getCandidateNFTs(preferences);

    // Score each candidate
    const scored = candidates.map(item => 
      this.calculateRecommendationScore(item, preferences, behavior, type)
    );

    // Sort by score and return top recommendations
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      // Analyze user's reading history to infer preferences
      const interactions = await storage.getUserInteractions(userId);
      
      const categoryFreq = new Map<string, number>();
      const keywordFreq = new Map<string, number>();
      let sentimentSum = 0;
      let sentimentCount = 0;

      interactions.forEach(interaction => {
        // Category preferences
        if (interaction.category) {
          categoryFreq.set(interaction.category, 
            (categoryFreq.get(interaction.category) || 0) + 1);
        }

        // Keyword preferences from titles
        if (interaction.title) {
          const keywords = this.extractKeywords(interaction.title);
          keywords.forEach(keyword => {
            keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1);
          });
        }

        // Sentiment preferences
        if (interaction.sentimentScore) {
          sentimentSum += parseFloat(interaction.sentimentScore);
          sentimentCount++;
        }
      });

      const topCategories = Array.from(categoryFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

      const topKeywords = Array.from(keywordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword]) => keyword);

      const avgSentiment = sentimentCount > 0 ? sentimentSum / sentimentCount : 0.5;
      const sentimentPreference = avgSentiment > 0.6 ? 'positive' 
        : avgSentiment < 0.4 ? 'negative' : 'neutral';

      return {
        categories: topCategories,
        keywords: topKeywords,
        sentimentPreference,
        readingTime: 'medium',
        nftInterests: topCategories,
        priceRange: { min: 0, max: 10 }
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      categories: ['AI & Technology', 'Finance & Crypto'],
      keywords: ['ai', 'technology', 'innovation'],
      sentimentPreference: 'mixed',
      readingTime: 'medium',
      nftInterests: ['technology'],
      priceRange: { min: 0, max: 5 }
    };
  }

  private async analyzeUserBehavior(userId: string): Promise<any> {
    if (this.userBehaviorCache.has(userId)) {
      return this.userBehaviorCache.get(userId);
    }

    try {
      const interactions = await storage.getUserInteractions(userId);
      
      const behavior = {
        readingPatterns: this.analyzeReadingPatterns(interactions),
        timePreferences: this.analyzeTimePreferences(interactions),
        engagementLevel: this.calculateEngagementLevel(interactions),
        trendinessPreference: this.analyzeTrendinessPreference(interactions)
      };

      this.userBehaviorCache.set(userId, behavior);
      return behavior;
    } catch (error) {
      return {
        readingPatterns: 'diverse',
        timePreferences: 'anytime',
        engagementLevel: 0.5,
        trendinessPreference: 0.5
      };
    }
  }

  private analyzeReadingPatterns(interactions: any[]): string {
    const categories = interactions.map(i => i.category).filter(Boolean);
    const uniqueCategories = new Set(categories);
    
    return uniqueCategories.size > 3 ? 'diverse' : 'focused';
  }

  private analyzeTimePreferences(interactions: any[]): string {
    const hours = interactions.map(i => new Date(i.timestamp).getHours());
    const morningReads = hours.filter(h => h >= 6 && h < 12).length;
    const afternoonReads = hours.filter(h => h >= 12 && h < 18).length;
    const eveningReads = hours.filter(h => h >= 18 || h < 6).length;

    if (morningReads > afternoonReads && morningReads > eveningReads) return 'morning';
    if (afternoonReads > eveningReads) return 'afternoon';
    if (eveningReads > 0) return 'evening';
    return 'anytime';
  }

  private calculateEngagementLevel(interactions: any[]): number {
    if (interactions.length === 0) return 0.5;
    
    const engagementScore = interactions.reduce((sum, interaction) => {
      let score = 0;
      if (interaction.readTime > 30) score += 0.3; // Read for more than 30 seconds
      if (interaction.shared) score += 0.4;
      if (interaction.liked) score += 0.2;
      if (interaction.commented) score += 0.1;
      return sum + score;
    }, 0);

    return Math.min(1, engagementScore / interactions.length);
  }

  private analyzeTrendinessPreference(interactions: any[]): number {
    const trendingScores = interactions
      .map(i => parseFloat(i.trendingScore || '0.5'))
      .filter(score => !isNaN(score));
    
    if (trendingScores.length === 0) return 0.5;
    
    return trendingScores.reduce((sum, score) => sum + score, 0) / trendingScores.length;
  }

  private async getCandidateArticles(preferences: UserPreferences): Promise<any[]> {
    return await storage.getArticles({
      limit: 100,
      categories: preferences.categories,
      timeRange: '24h',
      sortBy: 'publishedAt'
    });
  }

  private async getCandidateNFTs(preferences: UserPreferences): Promise<any[]> {
    return await storage.getNFTs({
      limit: 100,
      categories: preferences.nftInterests,
      priceRange: preferences.priceRange,
      available: true
    });
  }

  private calculateRecommendationScore(
    item: any, 
    preferences: UserPreferences, 
    behavior: any,
    type: 'articles' | 'nfts'
  ): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // Category match (30% weight)
    if (preferences.categories.includes(item.category)) {
      score += 30;
      reasons.push(`Matches your interest in ${item.category}`);
    }

    // Keyword match (25% weight)
    const itemText = `${item.title} ${item.content || ''}`.toLowerCase();
    const keywordMatches = preferences.keywords.filter(keyword => 
      itemText.includes(keyword.toLowerCase())
    ).length;
    
    if (keywordMatches > 0) {
      score += Math.min(25, keywordMatches * 5);
      reasons.push(`Contains ${keywordMatches} relevant keywords`);
    }

    // Sentiment match (15% weight)
    const itemSentiment = item.sentiment || 'neutral';
    if (preferences.sentimentPreference === 'mixed' || 
        preferences.sentimentPreference === itemSentiment) {
      score += 15;
      reasons.push(`Matches your sentiment preference`);
    }

    // Trending score alignment (15% weight)
    const trendingScore = parseFloat(item.trendingScore || '0.5');
    const trendingAlignment = 1 - Math.abs(trendingScore - behavior.trendinessPreference);
    score += trendingAlignment * 15;
    
    if (trendingScore > 0.7) {
      reasons.push('Trending content');
    }

    // Recency bonus (10% weight)
    const hoursOld = (Date.now() - new Date(item.publishedAt || item.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 6) {
      score += 10;
      reasons.push('Recent content');
    }

    // Quality score (5% weight)
    const qualityScore = parseFloat(item.factCheckScore || '0.5');
    score += qualityScore * 5;
    
    if (qualityScore > 0.8) {
      reasons.push('High quality content');
    }

    return {
      itemId: item.id,
      score: Math.min(100, score),
      reasons,
      type
    };
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
  }

  // Advanced search with AI-powered ranking
  async advancedSearch(query: string, filters: any = {}): Promise<any[]> {
    try {
      // Get initial results
      const results = await storage.searchContent(query, filters);
      
      // Use AI to re-rank results based on relevance
      const rankedResults = await this.aiRankResults(query, results);
      
      return rankedResults;
    } catch (error) {
      console.error('Advanced search error:', error);
      return await storage.searchContent(query, filters);
    }
  }

  private async aiRankResults(query: string, results: any[]): Promise<any[]> {
    try {
      const prompt = `
      Rank the following search results by relevance to the query: "${query}"
      
      Results:
      ${results.map((r, i) => `${i + 1}. ${r.title} - ${r.summary || ''}`).join('\n')}
      
      Return only the ranking numbers in order of relevance (e.g., "3,1,5,2,4")
      `;

      const ranking = await aiService.analyzeText(prompt);
      const rankOrder = ranking.split(',').map(n => parseInt(n.trim()) - 1);
      
      return rankOrder
        .filter(i => i >= 0 && i < results.length)
        .map(i => results[i]);
    } catch (error) {
      return results; // Fallback to original order
    }
  }
}

export const recommendationService = new RecommendationService();
