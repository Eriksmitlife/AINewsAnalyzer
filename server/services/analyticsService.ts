import { storage } from '../storage';
import type { SystemMetric } from '@shared/schema';

interface DashboardAnalytics {
  totalArticles: number;
  totalNfts: number;
  totalTransactions: number;
  totalAnalyses: number;
  avgSentimentScore: number;
  avgFactCheckScore: number;
  avgTrendingScore: number;
  recentMetrics: SystemMetric[];
  categoryDistribution: Array<{ category: string; count: number }>;
  sentimentDistribution: Array<{ sentiment: string; count: number; percentage: number }>;
  trendingArticles: any[];
  recentTransactions: any[];
  systemHealth: {
    apiResponseTime: number;
    activeNewsSources: number;
    totalNewsSources: number;
    aiModelAccuracy: number;
    cacheHitRate: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

class AnalyticsService {
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      // Get basic stats
      const stats = await storage.getDashboardStats();
      
      // Get recent system metrics
      const recentMetrics = await storage.getSystemMetrics(undefined, 24);
      
      // Get category distribution
      const categoryDistribution = await this.getCategoryDistribution();
      
      // Get sentiment distribution
      const sentimentDistribution = await this.getSentimentDistribution();
      
      // Get trending articles
      const trendingArticles = await storage.getTrendingArticles(5);
      
      // Get recent transactions
      const recentTransactions = await storage.getNftTransactions();
      
      // Get system health metrics
      const systemHealth = await this.getSystemHealth();

      return {
        ...stats,
        recentMetrics,
        categoryDistribution,
        sentimentDistribution,
        trendingArticles,
        recentTransactions: recentTransactions.slice(0, 10),
        systemHealth,
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw new Error('Failed to fetch dashboard analytics');
    }
  }

  async getCategoryDistribution(): Promise<Array<{ category: string; count: number }>> {
    try {
      // This would typically be done with a GROUP BY query
      // For now, simulate with multiple queries
      const articles = await storage.getArticles({ limit: 1000 });
      
      const categoryMap = new Map<string, number>();
      
      articles.forEach(article => {
        const category = article.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      
      return Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting category distribution:', error);
      return [];
    }
  }

  async getSentimentDistribution(): Promise<Array<{ sentiment: string; count: number; percentage: number }>> {
    try {
      const articles = await storage.getArticles({ limit: 1000 });
      
      const sentimentMap = new Map<string, number>();
      let total = 0;
      
      articles.forEach(article => {
        if (article.sentiment) {
          const sentiment = article.sentiment;
          sentimentMap.set(sentiment, (sentimentMap.get(sentiment) || 0) + 1);
          total++;
        }
      });
      
      return Array.from(sentimentMap.entries()).map(([sentiment, count]) => ({
        sentiment,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting sentiment distribution:', error);
      return [];
    }
  }

  async getSystemHealth(): Promise<{
    apiResponseTime: number;
    activeNewsSources: number;
    totalNewsSources: number;
    aiModelAccuracy: number;
    cacheHitRate: number;
    status: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      // Get API response time from recent metrics
      const responseTimeMetrics = await storage.getSystemMetrics('api_response_time', 1);
      const avgResponseTime = responseTimeMetrics.length > 0 
        ? responseTimeMetrics.reduce((sum, m) => sum + Number(m.value), 0) / responseTimeMetrics.length
        : 150; // Default value

      // Get news sources status
      const allSources = await storage.getNewsSources(false);
      const activeSources = await storage.getNewsSources(true);

      // Get AI model accuracy from recent metrics
      const accuracyMetrics = await storage.getSystemMetrics('ai_model_accuracy', 24);
      const aiModelAccuracy = accuracyMetrics.length > 0
        ? Number(accuracyMetrics[accuracyMetrics.length - 1].value)
        : 94.7; // Default value

      // Get cache hit rate from recent metrics
      const cacheMetrics = await storage.getSystemMetrics('cache_hit_rate', 1);
      const cacheHitRate = cacheMetrics.length > 0
        ? Number(cacheMetrics[cacheMetrics.length - 1].value)
        : 89.2; // Default value

      // Determine overall system status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (avgResponseTime > 500 || aiModelAccuracy < 80 || cacheHitRate < 70) {
        status = 'critical';
      } else if (avgResponseTime > 300 || aiModelAccuracy < 90 || cacheHitRate < 80) {
        status = 'warning';
      }

      return {
        apiResponseTime: Math.round(avgResponseTime),
        activeNewsSources: activeSources.length,
        totalNewsSources: allSources.length,
        aiModelAccuracy: Math.round(aiModelAccuracy * 10) / 10,
        cacheHitRate: Math.round(cacheHitRate * 10) / 10,
        status,
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        apiResponseTime: 200,
        activeNewsSources: 0,
        totalNewsSources: 0,
        aiModelAccuracy: 0,
        cacheHitRate: 0,
        status: 'critical',
      };
    }
  }

  async recordMetric(name: string, value: number, metadata?: any): Promise<void> {
    try {
      await storage.recordSystemMetric({
        metricName: name,
        value: value.toString(),
        metadata,
      });
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }

  async getArticleAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalViews: number;
    topCategories: Array<{ category: string; views: number }>;
    sentimentTrends: Array<{ date: string; positive: number; negative: number; neutral: number }>;
    popularArticles: any[];
  }> {
    try {
      const hours = timeRange === 'day' ? 24 : timeRange === 'week' ? 168 : 720;
      
      // Get articles from the specified time range
      const articles = await storage.getArticles({ 
        limit: 500,
        sortBy: 'viewCount',
        sortOrder: 'desc'
      });

      const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0);
      
      // Calculate top categories by views
      const categoryViews = new Map<string, number>();
      articles.forEach(article => {
        const category = article.category || 'Uncategorized';
        const views = article.viewCount || 0;
        categoryViews.set(category, (categoryViews.get(category) || 0) + views);
      });

      const topCategories = Array.from(categoryViews.entries())
        .map(([category, views]) => ({ category, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // For sentiment trends, we'd normally query by date
      // This is a simplified version
      const sentimentTrends = this.generateMockSentimentTrends(timeRange);

      const popularArticles = articles.slice(0, 10);

      return {
        totalViews,
        topCategories,
        sentimentTrends,
        popularArticles,
      };
    } catch (error) {
      console.error('Error getting article analytics:', error);
      throw new Error('Failed to fetch article analytics');
    }
  }

  async getNftAnalytics(): Promise<{
    totalSales: number;
    totalVolume: number;
    averagePrice: number;
    topSellingCategories: Array<{ category: string; sales: number; volume: number }>;
    recentSales: any[];
    priceHistory: Array<{ date: string; averagePrice: number }>;
  }> {
    try {
      const transactions = await storage.getNftTransactions();
      const salesTransactions = transactions.filter(t => t.type === 'sale' && t.status === 'completed');
      
      const totalSales = salesTransactions.length;
      const totalVolume = salesTransactions.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
      const averagePrice = totalSales > 0 ? totalVolume / totalSales : 0;

      // Get NFTs to analyze categories
      const nfts = await storage.getNfts({ limit: 500 });
      
      // This would require JOIN queries in real implementation
      const topSellingCategories = [
        { category: 'AI & Technology', sales: Math.floor(totalSales * 0.4), volume: totalVolume * 0.4 },
        { category: 'Finance & Crypto', sales: Math.floor(totalSales * 0.3), volume: totalVolume * 0.3 },
        { category: 'Startups', sales: Math.floor(totalSales * 0.2), volume: totalVolume * 0.2 },
        { category: 'Science', sales: Math.floor(totalSales * 0.1), volume: totalVolume * 0.1 },
      ];

      const recentSales = salesTransactions.slice(0, 10);
      
      // Generate mock price history
      const priceHistory = this.generateMockPriceHistory();

      return {
        totalSales,
        totalVolume: Math.round(totalVolume * 10000) / 10000,
        averagePrice: Math.round(averagePrice * 10000) / 10000,
        topSellingCategories,
        recentSales,
        priceHistory,
      };
    } catch (error) {
      console.error('Error getting NFT analytics:', error);
      throw new Error('Failed to fetch NFT analytics');
    }
  }

  private generateMockSentimentTrends(timeRange: 'day' | 'week' | 'month'): Array<{ date: string; positive: number; negative: number; neutral: number }> {
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        positive: Math.floor(Math.random() * 50) + 30,
        negative: Math.floor(Math.random() * 30) + 10,
        neutral: Math.floor(Math.random() * 40) + 20,
      });
    }
    
    return trends;
  }

  private generateMockPriceHistory(): Array<{ date: string; averagePrice: number }> {
    const history = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString().split('T')[0],
        averagePrice: Math.round((0.1 + Math.random() * 0.5) * 10000) / 10000,
      });
    }
    
    return history;
  }

  async startPerformanceMonitoring(): Promise<void> {
    // Record system metrics every minute
    setInterval(async () => {
      try {
        // Record API response time
        const start = Date.now();
        await storage.getDashboardStats();
        const responseTime = Date.now() - start;
        
        await this.recordMetric('api_response_time', responseTime);
        
        // Record AI model accuracy (would be calculated from recent analyses)
        await this.recordMetric('ai_model_accuracy', 0.947);
        
        // Record cache hit rate (would be from Redis stats)
        await this.recordMetric('cache_hit_rate', 0.892);
        
      } catch (error) {
        console.error('Error recording performance metrics:', error);
      }
    }, 60000); // Every minute

    console.log('Performance monitoring started');
  }
}

export const analyticsService = new AnalyticsService();

// Start performance monitoring on import
analyticsService.startPerformanceMonitoring();
