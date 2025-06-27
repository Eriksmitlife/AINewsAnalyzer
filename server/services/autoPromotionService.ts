import OpenAI from 'openai';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromotionCampaign {
  id: string;
  type: 'content_marketing' | 'social_media' | 'seo_optimization' | 'viral_marketing' | 'influencer_outreach';
  platform: string;
  content: {
    title: string;
    description: string;
    hashtags: string[];
    media?: string;
  };
  targetAudience: {
    demographics: string[];
    interests: string[];
    behaviors: string[];
  };
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    viralCoefficient: number;
  };
  status: 'active' | 'scheduled' | 'completed' | 'optimizing';
  createdAt: Date;
  updatedAt: Date;
}

interface ViralContent {
  contentType: 'article_summary' | 'meme' | 'infographic' | 'video_script' | 'tweet_thread';
  content: string;
  viralPotential: number;
  platforms: string[];
  trendingTopics: string[];
  emotionalTriggers: string[];
}

interface SEOStrategy {
  keywords: string[];
  contentPlan: {
    title: string;
    outline: string[];
    estimatedTraffic: number;
  }[];
  linkBuildingTargets: string[];
  competitorAnalysis: {
    competitor: string;
    strengths: string[];
    opportunities: string[];
  }[];
}

class AutoPromotionService {
  private campaigns: Map<string, PromotionCampaign> = new Map();
  private viralContentQueue: ViralContent[] = [];
  private isRunning = false;

  // Запуск автономной системы продвижения
  async startAutoPromotion(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🚀 Запуск автономной системы продвижения AutoNews.AI');

    // Запускаем основные процессы
    this.runContentMarketingLoop();
    this.runSocialMediaAutomation();
    this.runSEOOptimization();
    this.runViralMarketingEngine();
    this.runInfluencerOutreach();
    this.runTrafficAnalytics();

    // Самообучение и оптимизация каждые 6 часов
    setInterval(() => {
      this.optimizeCampaigns();
      this.analyzeTrends();
      this.updateStrategies();
    }, 6 * 60 * 60 * 1000);
  }

  // 1. Автоматический контент-маркетинг
  private async runContentMarketingLoop(): Promise<void> {
    setInterval(async () => {
      try {
        const latestNews = await storage.getArticles({ limit: 5, sortBy: 'publishedAt' });
        
        for (const article of latestNews) {
          // Создаем вирусный контент на основе новости
          const viralContent = await this.generateViralContent(article);
          
          // Оптимизируем для SEO
          const seoContent = await this.optimizeForSEO(article);
          
          // Создаем кампанию
          const campaign = await this.createContentCampaign(article, viralContent, seoContent);
          
          // Запускаем многоплатформенное продвижение
          await this.launchMultiPlatformCampaign(campaign);
        }
      } catch (error) {
        console.error('Ошибка в контент-маркетинге:', error);
      }
    }, 30 * 60 * 1000); // Каждые 30 минут
  }

  // 2. Автоматизация социальных сетей
  private async runSocialMediaAutomation(): Promise<void> {
    setInterval(async () => {
      try {
        // Анализируем тренды в социальных сетях
        const trends = await this.analyzeSocialTrends();
        
        // Создаем контент под тренды
        for (const trend of trends) {
          const content = await this.createTrendContent(trend);
          await this.schedulePostsAcrossPlatforms(content);
        }

        // Автоматическое взаимодействие и engagement
        await this.autoEngageWithCommunity();
        
      } catch (error) {
        console.error('Ошибка в SMM автоматизации:', error);
      }
    }, 15 * 60 * 1000); // Каждые 15 минут
  }

  // 3. SEO оптимизация и привлечение органического трафика
  private async runSEOOptimization(): Promise<void> {
    setInterval(async () => {
      try {
        // Анализ ключевых слов и конкурентов
        const keywords = await this.discoverHighValueKeywords();
        
        // Создание SEO-оптимизированного контента
        const seoStrategy = await this.developSEOStrategy(keywords);
        
        // Автоматическое создание мета-тегов и структурированных данных
        await this.optimizeOnPageSEO();
        
        // Линкбилдинг и PR
        await this.executeLinkBuildingStrategy(seoStrategy);
        
      } catch (error) {
        console.error('Ошибка в SEO оптимизации:', error);
      }
    }, 2 * 60 * 60 * 1000); // Каждые 2 часа
  }

  // 4. Вирусный маркетинг
  private async runViralMarketingEngine(): Promise<void> {
    setInterval(async () => {
      try {
        // Создание мемов и вирусного контента
        const memes = await this.generateMemes();
        
        // Создание провокационного контента
        const controversialContent = await this.createControversialContent();
        
        // Создание челленджей и конкурсов
        const challenges = await this.createChallenges();
        
        // Запуск вирусных кампаний
        await this.launchViralCampaigns([...memes, ...controversialContent, ...challenges]);
        
      } catch (error) {
        console.error('Ошибка в вирусном маркетинге:', error);
      }
    }, 45 * 60 * 1000); // Каждые 45 минут
  }

  // 5. Автоматический поиск и работа с инфлюенсерами
  private async runInfluencerOutreach(): Promise<void> {
    setInterval(async () => {
      try {
        // Поиск релевантных инфлюенсеров
        const influencers = await this.findRelevantInfluencers();
        
        // Персонализированные предложения
        for (const influencer of influencers) {
          const proposal = await this.generateInfluencerProposal(influencer);
          await this.sendAutomatedOutreach(influencer, proposal);
        }
        
        // Мониторинг и управление партнерствами
        await this.manageInfluencerPartnerships();
        
      } catch (error) {
        console.error('Ошибка в работе с инфлюенсерами:', error);
      }
    }, 4 * 60 * 60 * 1000); // Каждые 4 часа
  }

  // 6. Аналитика трафика и автооптимизация
  private async runTrafficAnalytics(): Promise<void> {
    setInterval(async () => {
      try {
        // Анализ метрик всех кампаний
        const analytics = await this.analyzeAllCampaigns();
        
        // Автоматическая оптимизация бюджетов
        await this.optimizeBudgetAllocation(analytics);
        
        // A/B тестирование контента
        await this.runAutomatedABTests();
        
        // Масштабирование успешных кампаний
        await this.scaleSuccessfulCampaigns(analytics);
        
      } catch (error) {
        console.error('Ошибка в аналитике:', error);
      }
    }, 60 * 60 * 1000); // Каждый час
  }

  // Генерация вирусного контента с ИИ
  private async generateViralContent(article: any): Promise<ViralContent> {
    const prompt = `
    Создай максимально вирусный контент на основе этой новости:
    Заголовок: ${article.title}
    Содержание: ${article.content?.substring(0, 500)}
    
    Требования:
    1. Контент должен быть максимально цепляющим и провокационным
    2. Использовать эмоциональные триггеры
    3. Включить тренды и мемы
    4. Адаптировать под разные платформы
    5. Добавить call-to-action для AutoNews.AI
    
    Верни JSON с полями: content, viralPotential (0-1), platforms, hashtags, emotionalTriggers
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        contentType: 'article_summary',
        content: result.content || '',
        viralPotential: result.viralPotential || 0.5,
        platforms: result.platforms || ['twitter', 'telegram', 'reddit'],
        trendingTopics: result.hashtags || [],
        emotionalTriggers: result.emotionalTriggers || []
      };
    } catch (error) {
      console.error('Ошибка генерации вирусного контента:', error);
      return {
        contentType: 'article_summary',
        content: `🔥 Эксклюзив на AutoNews.AI: ${article.title}`,
        viralPotential: 0.3,
        platforms: ['twitter'],
        trendingTopics: ['#AutoNewsAI', '#BreakingNews'],
        emotionalTriggers: ['urgency', 'exclusivity']
      };
    }
  }

  // Создание мемов автоматически
  private async generateMemes(): Promise<ViralContent[]> {
    const memePrompts = [
      'Создай мем про ИИ в новостях',
      'Мем про NFT и будущее журналистики',
      'Мем про автоматизацию всего',
      'Мем про криптовалюты и новости'
    ];

    const memes: ViralContent[] = [];

    for (const prompt of memePrompts) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{
            role: "user",
            content: `${prompt}. Создай текст мема с упоминанием AutoNews.AI. Верни JSON с полями: text, hashtags, platforms`
          }],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        
        memes.push({
          contentType: 'meme',
          content: result.text || '',
          viralPotential: 0.8,
          platforms: result.platforms || ['twitter', 'telegram', 'instagram'],
          trendingTopics: result.hashtags || [],
          emotionalTriggers: ['humor', 'relatability']
        });
      } catch (error) {
        console.error('Ошибка создания мема:', error);
      }
    }

    return memes;
  }

  // Анализ трендов в соцсетях
  private async analyzeSocialTrends(): Promise<string[]> {
    const trending = [
      'AI revolution',
      'Cryptocurrency news',
      'NFT marketplace',
      'Automated trading',
      'Future of journalism',
      'Blockchain technology',
      'Digital assets',
      'Smart contracts'
    ];

    // В реальности здесь будет API для анализа трендов
    return trending.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  // Создание контента под тренды
  private async createTrendContent(trend: string): Promise<ViralContent> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Создай вирусный пост про "${trend}" с упоминанием AutoNews.AI.
          Должен быть максимально engaging и побуждать к действию.
          Верни JSON с полями: text, hashtags, callToAction
          `
        }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        contentType: 'tweet_thread',
        content: result.text || '',
        viralPotential: 0.7,
        platforms: ['twitter', 'telegram', 'linkedin'],
        trendingTopics: result.hashtags || [],
        emotionalTriggers: ['FOMO', 'excitement', 'curiosity']
      };
    } catch (error) {
      console.error('Ошибка создания трендового контента:', error);
      return {
        contentType: 'tweet_thread',
        content: `🔥 ${trend} меняет мир! Узнай первым на AutoNews.AI`,
        viralPotential: 0.5,
        platforms: ['twitter'],
        trendingTopics: [`#${trend.replace(/\s/g, '')}`],
        emotionalTriggers: ['urgency']
      };
    }
  }

  // Автоматическое SEO
  private async optimizeForSEO(article: any): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Оптимизируй для SEO эту статью: ${article.title}
          
          Создай:
          1. SEO-заголовок (до 60 символов)
          2. Мета-описание (до 160 символов)
          3. 10 релевантных ключевых слов
          4. Структуру H1-H3 заголовков
          5. Внутренние ссылки на AutoNews.AI
          
          Верни JSON с этими полями
          `
        }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Ошибка SEO оптимизации:', error);
      return {
        seoTitle: article.title,
        metaDescription: article.content?.substring(0, 160),
        keywords: ['AutoNews.AI', 'AI news', 'blockchain'],
        headingStructure: [article.title],
        internalLinks: ['/']
      };
    }
  }

  // Поиск ключевых слов с высоким потенциалом
  private async discoverHighValueKeywords(): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Найди 20 высокопотенциальных ключевых слов для платформы AutoNews.AI:
          - AI-powered news platform
          - NFT news marketplace  
          - Cryptocurrency AutoNews Coin
          - Automated journalism
          - Blockchain news trading
          
          Верни JSON массив с ключевыми словами, отсортированными по потенциальному трафику
          `
        }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.keywords || [
        'AI news platform',
        'NFT news marketplace',
        'AutoNews Coin',
        'blockchain journalism',
        'automated news trading'
      ];
    } catch (error) {
      console.error('Ошибка поиска ключевых слов:', error);
      return ['AI news', 'NFT marketplace', 'crypto news'];
    }
  }

  // Создание челленджей и конкурсов
  private async createChallenges(): Promise<ViralContent[]> {
    const challengeTypes = [
      'Predict the next big news story',
      'Create the best news NFT',
      'Trade AutoNews Coin challenge',
      'AI vs Human news analysis'
    ];

    const challenges: ViralContent[] = [];

    for (const challenge of challengeTypes) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{
            role: "user",
            content: `
            Создай описание вирусного челленджа: "${challenge}"
            Должен быть максимально engaging с призами и правилами.
            Упомяни AutoNews.AI и ANC токены.
            Верни JSON с полями: title, description, rules, prizes, hashtags
            `
          }],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        
        challenges.push({
          contentType: 'viral_marketing',
          content: `${result.title}\n\n${result.description}\n\nПравила:\n${result.rules}\n\nПризы: ${result.prizes}`,
          viralPotential: 0.9,
          platforms: ['twitter', 'telegram', 'discord', 'reddit'],
          trendingTopics: result.hashtags || [],
          emotionalTriggers: ['competition', 'reward', 'achievement']
        });
      } catch (error) {
        console.error('Ошибка создания челленджа:', error);
      }
    }

    return challenges;
  }

  // Поиск релевантных инфлюенсеров
  private async findRelevantInfluencers(): Promise<any[]> {
    // В реальности здесь будет API для поиска инфлюенсеров
    return [
      {
        name: 'CryptoNewsExpert',
        platform: 'twitter',
        followers: 150000,
        engagement: 0.045,
        niche: 'cryptocurrency',
        contact: 'email@example.com'
      },
      {
        name: 'AITechInfluencer',
        platform: 'linkedin',
        followers: 80000,
        engagement: 0.032,
        niche: 'artificial intelligence',
        contact: 'contact@example.com'
      }
    ];
  }

  // Генерация предложений для инфлюенсеров
  private async generateInfluencerProposal(influencer: any): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Создай персонализированное предложение для инфлюенсера:
          Имя: ${influencer.name}
          Платформа: ${influencer.platform}
          Подписчики: ${influencer.followers}
          Ниша: ${influencer.niche}
          
          Предложи сотрудничество с AutoNews.AI. Включи:
          1. Персональное обращение
          2. Выгоды сотрудничества
          3. Конкретные условия
          4. ANC токены как часть оплаты
          5. Call to action
          
          Тон: профессиональный, но дружелюбный
          `
        }],
      });

      return response.choices[0].message.content || 'Стандартное предложение сотрудничества';
    } catch (error) {
      console.error('Ошибка создания предложения:', error);
      return `Привет ${influencer.name}! Предлагаем сотрудничество с AutoNews.AI - революционной платформой AI-новостей и NFT.`;
    }
  }

  // Запуск многоплатформенной кампании
  private async launchMultiPlatformCampaign(campaign: any): Promise<void> {
    console.log(`🚀 Запуск кампании: ${campaign.content?.title}`);
    
    // Здесь будет реальная интеграция с API социальных сетей
    const platforms = ['twitter', 'telegram', 'linkedin', 'reddit', 'discord'];
    
    for (const platform of platforms) {
      try {
        await this.postToPlatform(platform, campaign);
        console.log(`✅ Опубликовано на ${platform}`);
      } catch (error) {
        console.error(`❌ Ошибка публикации на ${platform}:`, error);
      }
    }
  }

  // Публикация на платформе (заглушка)
  private async postToPlatform(platform: string, campaign: any): Promise<void> {
    // Заглушка для демонстрации
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Сохраняем метрики кампании
    await storage.recordSystemMetric({
      metricName: 'promotion_campaign',
      value: '1',
      metadata: {
        platform,
        campaignType: campaign.type,
        content: campaign.content?.title
      },
      timestamp: new Date()
    });
  }

  // Автоматическое взаимодействие с сообществом
  private async autoEngageWithCommunity(): Promise<void> {
    console.log('🤖 Автоматическое взаимодействие с сообществом');
    
    // Здесь будет логика автоматических лайков, репостов, комментариев
    // в ответ на упоминания AutoNews.AI
  }

  // Анализ всех кампаний
  private async analyzeAllCampaigns(): Promise<any> {
    const campaigns = Array.from(this.campaigns.values());
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalReach: campaigns.reduce((sum, c) => sum + c.metrics.reach, 0),
      avgEngagement: campaigns.reduce((sum, c) => sum + c.metrics.engagement, 0) / campaigns.length,
      topPerforming: campaigns.sort((a, b) => b.metrics.viralCoefficient - a.metrics.viralCoefficient).slice(0, 5)
    };
  }

  // Оптимизация кампаний
  private async optimizeCampaigns(): Promise<void> {
    console.log('🔧 Оптимизация кампаний на основе ИИ-анализа');
    
    const analytics = await this.analyzeAllCampaigns();
    
    // Останавливаем неэффективные кампании
    for (const [id, campaign] of this.campaigns) {
      if (campaign.metrics.engagement < 0.01 && campaign.metrics.reach < 1000) {
        campaign.status = 'completed';
        console.log(`⏹️ Остановлена неэффективная кампания: ${id}`);
      }
    }
    
    // Масштабируем успешные
    await this.scaleSuccessfulCampaigns(analytics);
  }

  // Масштабирование успешных кампаний
  private async scaleSuccessfulCampaigns(analytics: any): Promise<void> {
    for (const campaign of analytics.topPerforming) {
      if (campaign.metrics.viralCoefficient > 1.5) {
        console.log(`📈 Масштабирование успешной кампании: ${campaign.id}`);
        
        // Создаем вариации успешного контента
        await this.createContentVariations(campaign);
        
        // Увеличиваем бюджет
        await this.increaseCampaignBudget(campaign.id);
      }
    }
  }

  // Создание вариаций контента
  private async createContentVariations(campaign: PromotionCampaign): Promise<void> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Создай 5 вариаций этого успешного контента:
          "${campaign.content.title}"
          "${campaign.content.description}"
          
          Сохрани основную идею, но измени подачу для разных аудиторий.
          Верни JSON массив с вариациями
          `
        }],
        response_format: { type: "json_object" },
      });

      const variations = JSON.parse(response.choices[0].message.content || '{}');
      
      // Запускаем новые кампании с вариациями
      for (const variation of variations.variations || []) {
        const newCampaign = {
          ...campaign,
          id: `variation_${Date.now()}_${Math.random()}`,
          content: {
            title: variation.title,
            description: variation.description,
            hashtags: campaign.content.hashtags
          }
        };
        
        await this.launchMultiPlatformCampaign(newCampaign);
      }
    } catch (error) {
      console.error('Ошибка создания вариаций:', error);
    }
  }

  // Увеличение бюджета кампании
  private async increaseCampaignBudget(campaignId: string): Promise<void> {
    console.log(`💰 Увеличение бюджета кампании: ${campaignId}`);
    // Логика увеличения бюджета
  }

  // A/B тестирование
  private async runAutomatedABTests(): Promise<void> {
    console.log('🧪 Запуск автоматических A/B тестов');
    
    // Создаем тестовые варианты заголовков, CTA, изображений
    const testVariants = await this.generateABTestVariants();
    
    for (const variant of testVariants) {
      await this.launchABTest(variant);
    }
  }

  // Генерация вариантов для A/B тестов
  private async generateABTestVariants(): Promise<any[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Создай 3 варианта заголовков для A/B теста AutoNews.AI:
          1. Эмоциональный заголовок
          2. Рациональный заголовок  
          3. Провокационный заголовок
          
          Каждый должен мотивировать посетить платформу.
          Верни JSON с массивом вариантов
          `
        }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.variants || [];
    } catch (error) {
      console.error('Ошибка генерации A/B тестов:', error);
      return [];
    }
  }

  // Запуск A/B теста
  private async launchABTest(variant: any): Promise<void> {
    console.log(`🧪 Запуск A/B теста: ${variant.title}`);
    // Логика запуска теста
  }

  // Создание контент кампании
  private async createContentCampaign(article: any, viralContent: ViralContent, seoContent: any): Promise<PromotionCampaign> {
    const campaign: PromotionCampaign = {
      id: `campaign_${Date.now()}_${Math.random()}`,
      type: 'content_marketing',
      platform: 'multi-platform',
      content: {
        title: viralContent.content,
        description: seoContent.metaDescription || article.content?.substring(0, 200),
        hashtags: [...viralContent.trendingTopics, '#AutoNewsAI', '#AINews'],
        media: article.imageUrl
      },
      targetAudience: {
        demographics: ['18-45', 'tech-savvy', 'crypto-interested'],
        interests: ['AI', 'blockchain', 'news', 'trading'],
        behaviors: ['early-adopters', 'social-media-active']
      },
      metrics: {
        reach: 0,
        engagement: 0,
        conversions: 0,
        viralCoefficient: viralContent.viralPotential
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  // Анализ трендов и обновление стратегий
  private async analyzeTrends(): Promise<void> {
    console.log('📊 Анализ глобальных трендов для оптимизации стратегии');
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `
          Проанализируй текущие тренды в:
          1. AI и машинном обучении
          2. Криптовалютах и блокчейне
          3. NFT и цифровых активах
          4. Новостной индустрии
          5. Социальных медиа
          
          Как AutoNews.AI может использовать эти тренды для роста?
          Верни JSON с рекомендациями по стратегии
          `
        }],
        response_format: { type: "json_object" },
      });

      const trends = JSON.parse(response.choices[0].message.content || '{}');
      await this.updatePromotionStrategy(trends);
      
    } catch (error) {
      console.error('Ошибка анализа трендов:', error);
    }
  }

  // Обновление стратегии продвижения
  private async updatePromotionStrategy(trends: any): Promise<void> {
    console.log('🔄 Обновление стратегии продвижения на основе трендов');
    
    // Сохраняем новую стратегию в базу данных
    await storage.recordSystemMetric({
      metricName: 'promotion_strategy_update',
      value: '1',
      metadata: {
        trends,
        timestamp: new Date().toISOString(),
        recommendations: trends.recommendations || []
      },
      timestamp: new Date()
    });
  }

  // Получение статистики продвижения
  async getPromotionStats(): Promise<any> {
    const campaigns = Array.from(this.campaigns.values());
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalReach: campaigns.reduce((sum, c) => sum + c.metrics.reach, 0),
      totalEngagement: campaigns.reduce((sum, c) => sum + c.metrics.engagement, 0),
      avgViralCoefficient: campaigns.reduce((sum, c) => sum + c.metrics.viralCoefficient, 0) / campaigns.length,
      platformDistribution: this.calculatePlatformDistribution(campaigns),
      topPerformingCampaigns: campaigns
        .sort((a, b) => b.metrics.viralCoefficient - a.metrics.viralCoefficient)
        .slice(0, 10),
      recentActivity: campaigns
        .filter(c => new Date(c.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000)
        .length
    };
  }

  private calculatePlatformDistribution(campaigns: PromotionCampaign[]): any {
    const distribution: { [key: string]: number } = {};
    
    campaigns.forEach(campaign => {
      distribution[campaign.platform] = (distribution[campaign.platform] || 0) + 1;
    });
    
    return distribution;
  }
}

export const autoPromotionService = new AutoPromotionService();