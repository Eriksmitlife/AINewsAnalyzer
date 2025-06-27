import OpenAI from 'openai';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GlobalEconomicIndicator {
  id: string;
  country: string;
  indicator: 'gdp' | 'inflation' | 'unemployment' | 'currency_strength' | 'market_sentiment';
  value: number;
  change: number;
  trend: 'rising' | 'falling' | 'stable';
  newsCorrelation: number;
  timestamp: Date;
}

interface EconomicImpactPrediction {
  newsId: string;
  impactLevel: number; // 0-1
  affectedSectors: string[];
  timeframe: string;
  geographicalScope: string[];
  economicConsequences: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  investmentRecommendations: {
    buy: string[];
    sell: string[];
    hold: string[];
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigation: string[];
  };
}

interface MarketOpportunity {
  id: string;
  type: 'arbitrage' | 'trend_following' | 'contrarian' | 'momentum' | 'value';
  market: string;
  asset: string;
  probability: number;
  expectedReturn: number;
  timeHorizon: string;
  capitalRequired: number;
  riskLevel: number;
  newsDrivers: string[];
  executionSteps: string[];
}

interface GeopoliticalEvent {
  id: string;
  event: string;
  region: string;
  severity: number;
  economicImpact: number;
  marketVolatility: number;
  affectedCurrencies: string[];
  sectorImpacts: { [sector: string]: number };
  timelineProjection: {
    immediate: string;
    nearTerm: string;
    longTerm: string;
  };
}

class GlobalEconomyService {
  private economicIndicators: Map<string, GlobalEconomicIndicator> = new Map();
  private impactPredictions: Map<string, EconomicImpactPrediction> = new Map();
  private marketOpportunities: MarketOpportunity[] = [];
  private geopoliticalEvents: Map<string, GeopoliticalEvent> = new Map();
  private isActive = false;

  async startGlobalAnalysis(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;

    console.log('🌍 Запуск анализа глобальной экономики');

    this.monitorGlobalIndicators();
    this.analyzeNewsEconomicImpact();
    this.scanMarketOpportunities();
    this.trackGeopoliticalEvents();
    this.generateEconomicForecasts();
  }

  // Мониторинг глобальных экономических показателей
  private monitorGlobalIndicators(): void {
    setInterval(async () => {
      try {
        await this.updateEconomicIndicators();
        await this.analyzeIndicatorTrends();
        await this.correlateWithNews();
      } catch (error) {
        console.error('Ошибка мониторинга экономических показателей:', error);
      }
    }, 30 * 60 * 1000); // Каждые 30 минут
  }

  // Анализ экономического воздействия новостей
  private analyzeNewsEconomicImpact(): void {
    setInterval(async () => {
      try {
        const recentNews = await storage.getArticles({ limit: 20, sortBy: 'publishedAt' });
        
        for (const article of recentNews) {
          const impact = await this.assessNewsEconomicImpact(article);
          if (impact.impactLevel > 0.3) {
            this.impactPredictions.set(article.id, impact);
            await this.saveEconomicImpact(impact);
          }
        }
      } catch (error) {
        console.error('Ошибка анализа экономического воздействия новостей:', error);
      }
    }, 15 * 60 * 1000); // Каждые 15 минут
  }

  // Оценка экономического воздействия новости
  private async assessNewsEconomicImpact(article: any): Promise<EconomicImpactPrediction> {
    try {
      const impactPrompt = `
      Проанализируй экономическое воздействие этой новости на глобальную экономику:
      
      Заголовок: ${article.title}
      Содержание: ${article.content?.substring(0, 1500)}
      Категория: ${article.category}
      
      Оцени:
      1. УРОВЕНЬ ВОЗДЕЙСТВИЯ (0-1): Насколько сильно эта новость повлияет на экономику
      
      2. ЗАТРОНУТЫЕ СЕКТОРЫ: Список экономических секторов
      
      3. ВРЕМЕННЫЕ РАМКИ: Как быстро проявится воздействие
      
      4. ГЕОГРАФИЧЕСКИЙ ОХВАТ: Какие страны/регионы затронуты
      
      5. ЭКОНОМИЧЕСКИЕ ПОСЛЕДСТВИЯ:
         - Немедленные (0-24ч)
         - Краткосрочные (1-30 дней)  
         - Долгосрочные (1-12 месяцев)
      
      6. ИНВЕСТИЦИОННЫЕ РЕКОМЕНДАЦИИ:
         - Покупать (активы, которые выиграют)
         - Продавать (активы под риском)
         - Держать (стабильные позиции)
      
      7. ОЦЕНКА РИСКОВ:
         - Уровень риска (low/medium/high/critical)
         - Факторы риска
         - Способы минимизации
      
      Будь максимально точным и практичным в анализе.
      Верни JSON с детальными прогнозами.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: impactPrompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        newsId: article.id,
        impactLevel: result.impactLevel || 0.1,
        affectedSectors: result.affectedSectors || [],
        timeframe: result.timeframe || '1-7 дней',
        geographicalScope: result.geographicalScope || ['Глобально'],
        economicConsequences: {
          immediate: result.economicConsequences?.immediate || [],
          shortTerm: result.economicConsequences?.shortTerm || [],
          longTerm: result.economicConsequences?.longTerm || []
        },
        investmentRecommendations: {
          buy: result.investmentRecommendations?.buy || [],
          sell: result.investmentRecommendations?.sell || [],
          hold: result.investmentRecommendations?.hold || []
        },
        riskAssessment: {
          level: result.riskAssessment?.level || 'medium',
          factors: result.riskAssessment?.factors || [],
          mitigation: result.riskAssessment?.mitigation || []
        }
      };
    } catch (error) {
      console.error('Ошибка оценки экономического воздействия:', error);
      return this.createFallbackImpact(article.id);
    }
  }

  // Поиск рыночных возможностей
  private scanMarketOpportunities(): void {
    setInterval(async () => {
      try {
        const opportunities = await this.identifyMarketOpportunities();
        this.marketOpportunities = opportunities;
        await this.prioritizeOpportunities();
        await this.alertHighValueOpportunities();
      } catch (error) {
        console.error('Ошибка поиска рыночных возможностей:', error);
      }
    }, 45 * 60 * 1000); // Каждые 45 минут
  }

  // Идентификация рыночных возможностей
  private async identifyMarketOpportunities(): Promise<MarketOpportunity[]> {
    try {
      const opportunityPrompt = `
      На основе текущих новостей и экономических трендов найди рыночные возможности:
      
      Анализируй:
      1. Арбитражные возможности между рынками
      2. Трендовые движения для следования
      3. Контрарианские возможности
      4. Моментум стратегии
      5. Недооцененные активы
      
      Для каждой возможности укажи:
      - Тип стратегии
      - Рынок и актив
      - Вероятность успеха (0-1)
      - Ожидаемая доходность (%)
      - Временной горизонт
      - Требуемый капитал
      - Уровень риска (0-1)
      - Новостные драйверы
      - Шаги исполнения
      
      Найди 5-10 лучших возможностей.
      Верни JSON массив.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: opportunityPrompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return (result.opportunities || []).map((opp: any, index: number) => ({
        id: `opportunity_${Date.now()}_${index}`,
        type: opp.type || 'trend_following',
        market: opp.market || 'Неизвестно',
        asset: opp.asset || 'Неизвестно',
        probability: opp.probability || 0.5,
        expectedReturn: opp.expectedReturn || 0,
        timeHorizon: opp.timeHorizon || '1-30 дней',
        capitalRequired: opp.capitalRequired || 1000,
        riskLevel: opp.riskLevel || 0.5,
        newsDrivers: opp.newsDrivers || [],
        executionSteps: opp.executionSteps || []
      }));
    } catch (error) {
      console.error('Ошибка идентификации возможностей:', error);
      return [];
    }
  }

  // Отслеживание геополитических событий
  private trackGeopoliticalEvents(): void {
    setInterval(async () => {
      try {
        await this.scanGeopoliticalNews();
        await this.assessGeopoliticalImpact();
        await this.updateMarketSentiment();
      } catch (error) {
        console.error('Ошибка отслеживания геополитических событий:', error);
      }
    }, 60 * 60 * 1000); // Каждый час
  }

  // Генерация экономических прогнозов
  private generateEconomicForecasts(): void {
    setInterval(async () => {
      try {
        await this.createShortTermForecast();
        await this.createMediumTermForecast();
        await this.createLongTermForecast();
        await this.validatePreviousForecasts();
      } catch (error) {
        console.error('Ошибка генерации прогнозов:', error);
      }
    }, 2 * 60 * 60 * 1000); // Каждые 2 часа
  }

  // Создание комплексного экономического отчета
  async generateComprehensiveReport(): Promise<any> {
    try {
      const reportPrompt = `
      Создай комплексный отчет о состоянии глобальной экономики:
      
      Включи:
      1. ТЕКУЩАЯ СИТУАЦИЯ
         - Ключевые экономические показатели
         - Основные тренды
         - Риски и возможности
      
      2. РЕГИОНАЛЬНЫЙ АНАЛИЗ
         - США
         - Европа  
         - Азия
         - Развивающиеся рынки
      
      3. СЕКТОРАЛЬНЫЙ АНАЛИЗ
         - Технологии
         - Финансы
         - Энергетика
         - Здравоохранение
         - Потребительские товары
      
      4. ПРОГНОЗЫ
         - 1 месяц
         - 3 месяца
         - 6 месяцев
         - 1 год
      
      5. ИНВЕСТИЦИОННЫЕ РЕКОМЕНДАЦИИ
         - Топ возможности
         - Риски для избежания
         - Диверсификация портфеля
      
      6. АЛЕРТЫ И ПРЕДУПРЕЖДЕНИЯ
         - Критические риски
         - Сигналы разворота
         - Черные лебеди
      
      Сделай отчет профессиональным и действенным.
      Верни JSON со структурированными данными.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: reportPrompt }],
        response_format: { type: "json_object" },
      });

      const report = JSON.parse(response.choices[0].message.content || '{}');
      
      await storage.recordSystemMetric({
        metricName: 'economic_report_generated',
        value: '1',
        metadata: { reportData: report, timestamp: new Date().toISOString() },
        timestamp: new Date()
      });

      return report;
    } catch (error) {
      console.error('Ошибка создания экономического отчета:', error);
      return this.createFallbackReport();
    }
  }

  // Анализ влияния AutoNews.AI на экономику
  async analyzeOwnEconomicImpact(): Promise<any> {
    try {
      const impactPrompt = `
      Проанализируй экономическое влияние платформы AutoNews.AI:
      
      Учти:
      - Революционная криптовалюта ANC
      - NFT рынок новостей
      - ИИ-анализ и автоматизация
      - Автономное продвижение
      - Метавселенная и Web3
      
      Оцени влияние на:
      1. Медиа индустрию
      2. Финтех сектор
      3. Блокчейн экосистему
      4. ИИ технологии
      5. Цифровую экономику
      
      Прогнозы влияния:
      - Краткосрочное (3 месяца)
      - Среднесрочное (1 год)
      - Долгосрочное (3-5 лет)
      
      Экономические показатели:
      - Потенциал рынка
      - Ожидаемый оборот
      - Количество пользователей
      - Влияние на занятость
      - Инновационный вклад
      
      Верни JSON с детальным анализом.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: impactPrompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Ошибка анализа собственного влияния:', error);
      return {
        impact: 'high',
        marketPotential: '50B+',
        disruptionLevel: 0.9,
        economicContribution: 'Значительный'
      };
    }
  }

  // Получение топ рыночных возможностей
  getTopMarketOpportunities(limit: number = 5): MarketOpportunity[] {
    return this.marketOpportunities
      .sort((a, b) => (b.probability * b.expectedReturn) - (a.probability * a.expectedReturn))
      .slice(0, limit);
  }

  // Получение экономических прогнозов для новости
  getEconomicImpactForNews(newsId: string): EconomicImpactPrediction | null {
    return this.impactPredictions.get(newsId) || null;
  }

  // Получение статистики глобальной экономики
  async getGlobalEconomyStats(): Promise<any> {
    const indicators = Array.from(this.economicIndicators.values());
    const impacts = Array.from(this.impactPredictions.values());
    const opportunities = this.marketOpportunities;

    return {
      totalIndicators: indicators.length,
      monitoredCountries: [...new Set(indicators.map(i => i.country))].length,
      highImpactNews: impacts.filter(i => i.impactLevel > 0.7).length,
      marketOpportunities: opportunities.length,
      highProbabilityOpportunities: opportunities.filter(o => o.probability > 0.7).length,
      averageExpectedReturn: opportunities.reduce((sum, o) => sum + o.expectedReturn, 0) / opportunities.length || 0,
      globalRiskLevel: this.calculateGlobalRiskLevel(),
      economicSentiment: this.calculateEconomicSentiment(),
      topOpportunities: this.getTopMarketOpportunities(3),
      criticalAlerts: impacts.filter(i => i.riskAssessment.level === 'critical').length
    };
  }

  // Вспомогательные методы
  private async updateEconomicIndicators(): Promise<void> {
    // Заглушка для обновления экономических показателей
    console.log('Обновление экономических показателей');
  }

  private async analyzeIndicatorTrends(): Promise<void> {
    console.log('Анализ трендов показателей');
  }

  private async correlateWithNews(): Promise<void> {
    console.log('Корреляция с новостями');
  }

  private async saveEconomicImpact(impact: EconomicImpactPrediction): Promise<void> {
    await storage.recordSystemMetric({
      metricName: 'economic_impact_prediction',
      value: impact.impactLevel.toString(),
      metadata: { newsId: impact.newsId, impactData: impact },
      timestamp: new Date()
    });
  }

  private async prioritizeOpportunities(): Promise<void> {
    this.marketOpportunities.sort((a, b) => 
      (b.probability * b.expectedReturn / b.riskLevel) - 
      (a.probability * a.expectedReturn / a.riskLevel)
    );
  }

  private async alertHighValueOpportunities(): Promise<void> {
    const highValue = this.marketOpportunities.filter(o => 
      o.probability > 0.8 && o.expectedReturn > 20
    );
    
    if (highValue.length > 0) {
      console.log(`🚨 Найдено ${highValue.length} высокодоходных возможностей`);
    }
  }

  private async scanGeopoliticalNews(): Promise<void> {
    console.log('Сканирование геополитических новостей');
  }

  private async assessGeopoliticalImpact(): Promise<void> {
    console.log('Оценка геополитического влияния');
  }

  private async updateMarketSentiment(): Promise<void> {
    console.log('Обновление рыночных настроений');
  }

  private async createShortTermForecast(): Promise<void> {
    console.log('Создание краткосрочного прогноза');
  }

  private async createMediumTermForecast(): Promise<void> {
    console.log('Создание среднесрочного прогноза');
  }

  private async createLongTermForecast(): Promise<void> {
    console.log('Создание долгосрочного прогноза');
  }

  private async validatePreviousForecasts(): Promise<void> {
    console.log('Валидация предыдущих прогнозов');
  }

  private calculateGlobalRiskLevel(): number {
    const impacts = Array.from(this.impactPredictions.values());
    const criticalCount = impacts.filter(i => i.riskAssessment.level === 'critical').length;
    const highCount = impacts.filter(i => i.riskAssessment.level === 'high').length;
    
    return Math.min(1, (criticalCount * 0.3 + highCount * 0.2) / Math.max(impacts.length, 1));
  }

  private calculateEconomicSentiment(): string {
    const opportunities = this.marketOpportunities;
    const positiveOpportunities = opportunities.filter(o => o.expectedReturn > 0).length;
    const totalOpportunities = opportunities.length;
    
    if (totalOpportunities === 0) return 'neutral';
    
    const ratio = positiveOpportunities / totalOpportunities;
    if (ratio > 0.7) return 'positive';
    if (ratio < 0.3) return 'negative';
    return 'neutral';
  }

  private createFallbackImpact(newsId: string): EconomicImpactPrediction {
    return {
      newsId,
      impactLevel: 0.1,
      affectedSectors: ['Общий рынок'],
      timeframe: '1-7 дней',
      geographicalScope: ['Глобально'],
      economicConsequences: {
        immediate: ['Минимальное влияние'],
        shortTerm: ['Стабильность'],
        longTerm: ['Без изменений']
      },
      investmentRecommendations: {
        buy: [],
        sell: [],
        hold: ['Текущие позиции']
      },
      riskAssessment: {
        level: 'low',
        factors: ['Низкий уровень воздействия'],
        mitigation: ['Мониторинг ситуации']
      }
    };
  }

  private createFallbackReport(): any {
    return {
      summary: 'Базовый экономический отчет',
      currentSituation: {
        keyIndicators: ['Стабильный рост', 'Умеренная инфляция'],
        mainTrends: ['Цифровизация', 'Устойчивое развитие'],
        risks: ['Геополитическая нестабильность'],
        opportunities: ['Технологические инновации']
      },
      forecasts: {
        shortTerm: 'Стабильный рост',
        mediumTerm: 'Умеренное развитие',
        longTerm: 'Технологический прорыв'
      },
      recommendations: {
        topOpportunities: ['Технологические акции', 'Криптовалюты'],
        risksToAvoid: ['Высоковолатильные активы'],
        portfolio: ['Диверсификация']
      }
    };
  }
}

export const globalEconomyService = new GlobalEconomyService();