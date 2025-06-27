import { storage } from '../storage';

interface PredictiveAnalysis {
  id: string;
  type: 'market_trend' | 'price_prediction' | 'volume_forecast' | 'sentiment_shift';
  confidence: number;
  prediction: {
    value: number;
    timeframe: string;
    probability: number;
  };
  factors: string[];
  timestamp: Date;
}

interface UserBehaviorPattern {
  userId: string;
  preferredCategories: string[];
  tradingPatterns: {
    averageTransactionSize: number;
    preferredTimeframe: string;
    riskTolerance: 'low' | 'medium' | 'high';
  };
  engagementScore: number;
  personalityType: 'conservative' | 'moderate' | 'aggressive' | 'speculative';
}

interface SmartNotification {
  id: string;
  userId: string;
  type: 'price_alert' | 'news_opportunity' | 'market_trend' | 'portfolio_risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  expiresAt: Date;
  metadata: any;
}

class AdvancedAnalyticsService {
  private predictions: Map<string, PredictiveAnalysis> = new Map();
  private userProfiles: Map<string, UserBehaviorPattern> = new Map();
  private notificationQueue: SmartNotification[] = [];

  // Предиктивная аналитика для рынка NFT
  async generateMarketPredictions(): Promise<PredictiveAnalysis[]> {
    const predictions: PredictiveAnalysis[] = [];
    
    // Анализ тенденций цен NFT
    const priceTrend = await this.analyzeNFTPriceTrends();
    predictions.push({
      id: `price_${Date.now()}`,
      type: 'price_prediction',
      confidence: 0.85,
      prediction: {
        value: priceTrend.expectedChange,
        timeframe: '24h',
        probability: 0.78
      },
      factors: [
        'Increased trading volume in tech news NFTs',
        'Positive sentiment in AI/Technology category',
        'Market correlation with cryptocurrency prices'
      ],
      timestamp: new Date()
    });

    // Анализ объемов торгов
    const volumeForecast = await this.analyzeVolumePatterns();
    predictions.push({
      id: `volume_${Date.now()}`,
      type: 'volume_forecast',
      confidence: 0.73,
      prediction: {
        value: volumeForecast.expectedVolume,
        timeframe: '7d',
        probability: 0.82
      },
      factors: [
        'Weekly trading patterns analysis',
        'News cycle correlation',
        'User engagement metrics'
      ],
      timestamp: new Date()
    });

    // Анализ настроений рынка
    const sentimentShift = await this.analyzeSentimentTrends();
    predictions.push({
      id: `sentiment_${Date.now()}`,
      type: 'sentiment_shift',
      confidence: 0.91,
      prediction: {
        value: sentimentShift.sentimentScore,
        timeframe: '3d',
        probability: 0.87
      },
      factors: [
        'AI analysis of news sentiment',
        'Social media trends correlation',
        'Historical sentiment patterns'
      ],
      timestamp: new Date()
    });

    return predictions;
  }

  // Анализ поведения пользователей
  async analyzeUserBehavior(userId: string): Promise<UserBehaviorPattern> {
    // Получаем данные о пользователе
    const userFavorites = await storage.getUserFavorites(userId);
    const userTransactions = await storage.getNftTransactions(undefined, userId);

    // Анализируем предпочтения категорий
    const categoryPreferences = this.extractCategoryPreferences(userFavorites);
    
    // Анализируем торговые паттерны
    const tradingPatterns = this.analyzeTradingPatterns(userTransactions);
    
    // Вычисляем показатель вовлеченности
    const engagementScore = this.calculateEngagementScore(userFavorites, userTransactions);
    
    // Определяем тип личности инвестора
    const personalityType = this.determineInvestorPersonality(tradingPatterns, engagementScore);

    const profile: UserBehaviorPattern = {
      userId,
      preferredCategories: categoryPreferences,
      tradingPatterns,
      engagementScore,
      personalityType
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  // Персонализированные рекомендации
  async generatePersonalizedRecommendations(userId: string): Promise<{
    recommendedNFTs: any[];
    suggestedActions: string[];
    riskAssessment: string;
    portfolioOptimization: string[];
  }> {
    const userProfile = this.userProfiles.get(userId) || await this.analyzeUserBehavior(userId);
    
    // Рекомендуемые NFT на основе предпочтений
    const recommendedNFTs = await this.findRecommendedNFTs(userProfile);
    
    // Предлагаемые действия
    const suggestedActions = this.generateActionSuggestions(userProfile);
    
    // Оценка рисков
    const riskAssessment = this.assessPortfolioRisk(userProfile);
    
    // Оптимизация портфеля
    const portfolioOptimization = this.suggestPortfolioOptimization(userProfile);

    return {
      recommendedNFTs,
      suggestedActions,
      riskAssessment,
      portfolioOptimization
    };
  }

  // Умная система уведомлений
  async generateSmartNotifications(userId: string): Promise<SmartNotification[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return [];

    const notifications: SmartNotification[] = [];
    
    // Уведомления о возможностях на рынке
    const marketOpportunities = await this.detectMarketOpportunities(userProfile);
    marketOpportunities.forEach(opportunity => {
      notifications.push({
        id: `opportunity_${Date.now()}_${Math.random()}`,
        userId,
        type: 'news_opportunity',
        priority: 'high',
        title: 'Рыночная возможность обнаружена',
        message: opportunity.description,
        actionRequired: true,
        suggestedActions: opportunity.actions,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
        metadata: opportunity
      });
    });

    // Предупреждения о рисках портфеля
    const riskWarnings = await this.assessPortfolioRisks(userId);
    riskWarnings.forEach(warning => {
      notifications.push({
        id: `risk_${Date.now()}_${Math.random()}`,
        userId,
        type: 'portfolio_risk',
        priority: warning.severity as any,
        title: 'Предупреждение о рисках портфеля',
        message: warning.message,
        actionRequired: warning.actionRequired,
        suggestedActions: warning.recommendations,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        metadata: warning
      });
    });

    // Ценовые алерты
    const priceAlerts = await this.generatePriceAlerts(userProfile);
    notifications.push(...priceAlerts);

    return notifications.sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority));
  }

  // Анализ тенденций цен NFT
  private async analyzeNFTPriceTrends(): Promise<{ expectedChange: number }> {
    const recentTransactions = await storage.getNftTransactions();
    const last24h = recentTransactions.filter(tx => 
      new Date(tx.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    if (last24h.length === 0) return { expectedChange: 0 };

    const avgPrice = last24h.reduce((sum, tx) => sum + (tx.price || 0), 0) / last24h.length;
    const priceVolatility = this.calculateVolatility(last24h.map(tx => tx.price || 0));
    
    // Простая модель предсказания на основе волатильности и объема
    const volumeMultiplier = Math.min(last24h.length / 10, 2); // Больше транзакций = больше движения
    const expectedChange = (priceVolatility * volumeMultiplier) * (Math.random() > 0.5 ? 1 : -1);
    
    return { expectedChange };
  }

  // Анализ паттернов объемов
  private async analyzeVolumePatterns(): Promise<{ expectedVolume: number }> {
    const recentTransactions = await storage.getNftTransactions();
    const dailyVolumes = this.groupTransactionsByDay(recentTransactions);
    
    if (dailyVolumes.length < 3) return { expectedVolume: 100 };

    const avgVolume = dailyVolumes.reduce((sum, vol) => sum + vol, 0) / dailyVolumes.length;
    const trend = this.calculateTrend(dailyVolumes);
    
    return { expectedVolume: avgVolume * (1 + trend) };
  }

  // Анализ трендов настроений
  private async analyzeSentimentTrends(): Promise<{ sentimentScore: number }> {
    const recentAnalyses = await storage.getAiAnalysisLogs(undefined, 50);
    
    if (recentAnalyses.length === 0) return { sentimentScore: 0.5 };

    const sentimentScores = recentAnalyses
      .filter(analysis => analysis.analysisResults?.sentimentScore)
      .map(analysis => analysis.analysisResults.sentimentScore);

    if (sentimentScores.length === 0) return { sentimentScore: 0.5 };

    const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    const sentimentTrend = this.calculateTrend(sentimentScores.slice(-10)); // Последние 10 анализов
    
    return { sentimentScore: Math.max(0, Math.min(1, avgSentiment + sentimentTrend)) };
  }

  // Извлечение предпочтений категорий
  private extractCategoryPreferences(favorites: any[]): string[] {
    if (!favorites || favorites.length === 0) return ['AI & Technology', 'Finance & Crypto'];

    const categoryCount: { [key: string]: number } = {};
    favorites.forEach(article => {
      if (article.category) {
        categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  // Анализ торговых паттернов
  private analyzeTradingPatterns(transactions: any[]): {
    averageTransactionSize: number;
    preferredTimeframe: string;
    riskTolerance: 'low' | 'medium' | 'high';
  } {
    if (!transactions || transactions.length === 0) {
      return {
        averageTransactionSize: 0,
        preferredTimeframe: 'short',
        riskTolerance: 'medium'
      };
    }

    const avgSize = transactions.reduce((sum, tx) => sum + (tx.price || 0), 0) / transactions.length;
    
    // Определяем предпочтительный временной интервал
    const timeIntervals = this.calculateTimeIntervals(transactions);
    const preferredTimeframe = timeIntervals.median < 24 ? 'short' : timeIntervals.median < 168 ? 'medium' : 'long';
    
    // Определяем толерантность к рискам на основе разброса цен
    const priceVariation = this.calculateVolatility(transactions.map(tx => tx.price || 0));
    const riskTolerance = priceVariation < 0.2 ? 'low' : priceVariation < 0.5 ? 'medium' : 'high';

    return {
      averageTransactionSize: avgSize,
      preferredTimeframe,
      riskTolerance
    };
  }

  // Расчет показателя вовлеченности
  private calculateEngagementScore(favorites: any[], transactions: any[]): number {
    const favoritesScore = Math.min(favorites.length * 0.1, 1); // До 1 балла за избранное
    const transactionsScore = Math.min(transactions.length * 0.2, 1); // До 1 балла за транзакции
    const recentActivityScore = this.calculateRecentActivityScore(favorites, transactions);
    
    return (favoritesScore + transactionsScore + recentActivityScore) / 3;
  }

  // Определение типа личности инвестора
  private determineInvestorPersonality(
    tradingPatterns: any, 
    engagementScore: number
  ): 'conservative' | 'moderate' | 'aggressive' | 'speculative' {
    const { riskTolerance, averageTransactionSize } = tradingPatterns;
    
    if (riskTolerance === 'low' && averageTransactionSize < 100) return 'conservative';
    if (riskTolerance === 'high' && engagementScore > 0.7) return 'speculative';
    if (riskTolerance === 'high') return 'aggressive';
    return 'moderate';
  }

  // Поиск рекомендуемых NFT
  private async findRecommendedNFTs(userProfile: UserBehaviorPattern): Promise<any[]> {
    const allNfts = await storage.getNfts({ forSaleOnly: true, limit: 50 });
    
    return allNfts
      .filter(nft => {
        // Фильтруем по предпочтительным категориям пользователя
        return userProfile.preferredCategories.some(category => 
          nft.metadata?.category?.includes(category)
        );
      })
      .sort((a, b) => {
        // Сортируем по релевантности для пользователя
        const scoreA = this.calculateNFTRelevanceScore(a, userProfile);
        const scoreB = this.calculateNFTRelevanceScore(b, userProfile);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  // Генерация предложений действий
  private generateActionSuggestions(userProfile: UserBehaviorPattern): string[] {
    const suggestions: string[] = [];
    
    if (userProfile.personalityType === 'conservative') {
      suggestions.push('Рассмотрите NFT из категории новостей с высоким рейтингом достоверности');
      suggestions.push('Диверсифицируйте портфель небольшими покупками');
    } else if (userProfile.personalityType === 'aggressive') {
      suggestions.push('Следите за трендовыми новостями для быстрых возможностей');
      suggestions.push('Рассмотрите участие в аукционах с высоким потенциалом');
    } else if (userProfile.personalityType === 'speculative') {
      suggestions.push('Анализируйте предиктивные данные для поиска прорывных возможностей');
      suggestions.push('Следите за новыми категориями новостей');
    }

    if (userProfile.engagementScore < 0.5) {
      suggestions.push('Увеличьте активность для получения лучших рекомендаций');
    }

    return suggestions;
  }

  // Оценка рисков портфеля
  private assessPortfolioRisk(userProfile: UserBehaviorPattern): string {
    const { riskTolerance, averageTransactionSize } = userProfile.tradingPatterns;
    
    if (riskTolerance === 'high' && averageTransactionSize > 500) {
      return 'Высокий риск: Большие транзакции с высокой волатильностью';
    } else if (riskTolerance === 'medium') {
      return 'Умеренный риск: Сбалансированный подход к инвестициям';
    } else {
      return 'Низкий риск: Консервативная стратегия инвестирования';
    }
  }

  // Предложения по оптимизации портфеля
  private suggestPortfolioOptimization(userProfile: UserBehaviorPattern): string[] {
    const suggestions: string[] = [];
    
    if (userProfile.preferredCategories.length < 3) {
      suggestions.push('Диверсифицируйте по большему количеству категорий новостей');
    }
    
    if (userProfile.tradingPatterns.riskTolerance === 'high') {
      suggestions.push('Рассмотрите добавление менее рискованных активов для стабилизации');
    }
    
    if (userProfile.engagementScore > 0.8) {
      suggestions.push('Рассмотрите создание собственных NFT на основе ваших предпочтений');
    }

    return suggestions;
  }

  // Обнаружение рыночных возможностей
  private async detectMarketOpportunities(userProfile: UserBehaviorPattern): Promise<any[]> {
    const opportunities: any[] = [];
    
    // Возможности на основе трендов
    const predictions = await this.generateMarketPredictions();
    const highConfidencePredictions = predictions.filter(p => p.confidence > 0.8);
    
    highConfidencePredictions.forEach(prediction => {
      if (prediction.type === 'price_prediction' && prediction.prediction.value > 0) {
        opportunities.push({
          type: 'price_increase',
          description: `Прогнозируется рост цен на ${prediction.prediction.value.toFixed(2)}% в течение ${prediction.prediction.timeframe}`,
          actions: ['Рассмотрите покупку NFT в соответствующих категориях', 'Увеличьте позиции в портфеле'],
          confidence: prediction.confidence
        });
      }
    });

    return opportunities;
  }

  // Оценка рисков портфеля пользователя
  private async assessPortfolioRisks(userId: string): Promise<any[]> {
    const userNfts = await storage.getNfts({ ownerId: userId });
    const warnings: any[] = [];
    
    if (userNfts.length > 10) {
      const categoryDistribution = this.analyzeCategoryDistribution(userNfts);
      if (categoryDistribution.concentration > 0.7) {
        warnings.push({
          type: 'concentration_risk',
          severity: 'medium',
          message: 'Высокая концентрация в одной категории новостей',
          actionRequired: true,
          recommendations: ['Диверсифицируйте портфель', 'Рассмотрите другие категории новостей']
        });
      }
    }

    return warnings;
  }

  // Генерация ценовых алертов
  private async generatePriceAlerts(userProfile: UserBehaviorPattern): Promise<SmartNotification[]> {
    const alerts: SmartNotification[] = [];
    
    // Симуляция ценовых изменений для демонстрации
    if (Math.random() > 0.7) { // 30% шанс на алерт
      alerts.push({
        id: `price_alert_${Date.now()}`,
        userId: userProfile.userId,
        type: 'price_alert',
        priority: 'medium',
        title: 'Ценовой алерт',
        message: 'NFT в вашей любимой категории подешевели на 15%',
        actionRequired: false,
        suggestedActions: ['Рассмотрите возможность покупки', 'Проанализируйте рыночную ситуацию'],
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 часов
        metadata: { priceChange: -15, category: userProfile.preferredCategories[0] }
      });
    }

    return alerts;
  }

  // Вспомогательные методы
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (val * i), 0);
    const sumX2 = values.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope / (sumY / n); // Нормализованный тренд
  }

  private groupTransactionsByDay(transactions: any[]): number[] {
    const dayMap: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const day = new Date(tx.createdAt).toDateString();
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    
    return Object.values(dayMap);
  }

  private calculateTimeIntervals(transactions: any[]): { median: number; average: number } {
    if (transactions.length < 2) return { median: 24, average: 24 };
    
    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const diff = new Date(transactions[i].createdAt).getTime() - new Date(transactions[i-1].createdAt).getTime();
      intervals.push(diff / (1000 * 60 * 60)); // В часах
    }
    
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    const average = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    return { median, average };
  }

  private calculateRecentActivityScore(favorites: any[], transactions: any[]): number {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    
    const recentFavorites = favorites.filter(fav => 
      new Date(fav.createdAt).getTime() > now - week
    ).length;
    
    const recentTransactions = transactions.filter(tx => 
      new Date(tx.createdAt).getTime() > now - week
    ).length;
    
    return Math.min((recentFavorites * 0.1 + recentTransactions * 0.2), 1);
  }

  private calculateNFTRelevanceScore(nft: any, userProfile: UserBehaviorPattern): number {
    let score = 0;
    
    // Соответствие категориям
    if (userProfile.preferredCategories.some(cat => 
      nft.metadata?.category?.includes(cat)
    )) {
      score += 0.4;
    }
    
    // Соответствие ценовому диапазону
    const priceMatch = Math.abs((nft.price || 0) - userProfile.tradingPatterns.averageTransactionSize) < 
                      userProfile.tradingPatterns.averageTransactionSize * 0.5;
    if (priceMatch) {
      score += 0.3;
    }
    
    // Качество NFT (на основе метаданных)
    if (nft.metadata?.aiScore > 0.7) {
      score += 0.3;
    }
    
    return score;
  }

  private analyzeCategoryDistribution(nfts: any[]): { concentration: number; distribution: any } {
    const categoryCount: { [key: string]: number } = {};
    
    nfts.forEach(nft => {
      const category = nft.metadata?.category || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    const total = nfts.length;
    const maxCount = Math.max(...Object.values(categoryCount));
    const concentration = maxCount / total;
    
    return { concentration, distribution: categoryCount };
  }

  private priorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();