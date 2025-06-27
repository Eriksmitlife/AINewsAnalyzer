
import { storage } from '../storage';

interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number[];
  startDate: Date;
  endDate?: Date;
  metrics: string[];
  results?: ABTestResults;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: any;
  traffic: number;
}

interface ABTestResults {
  conversions: Record<string, number>;
  significance: number;
  winner?: string;
  confidence: number;
}

class ABTestingService {
  private activeTests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Record<string, string>> = new Map();

  async createTest(testConfig: Partial<ABTest>): Promise<string> {
    const test: ABTest = {
      id: `test_${Date.now()}`,
      name: testConfig.name || 'New A/B Test',
      description: testConfig.description || '',
      variants: testConfig.variants || [],
      status: 'draft',
      trafficSplit: testConfig.trafficSplit || [50, 50],
      startDate: new Date(),
      metrics: testConfig.metrics || ['conversion_rate'],
      ...testConfig
    };

    this.activeTests.set(test.id, test);
    
    await storage.recordSystemMetric({
      metricName: 'ab_test_created',
      value: '1',
      metadata: {
        testId: test.id,
        testName: test.name,
        variants: test.variants.length
      },
      timestamp: new Date()
    });

    console.log(`🧪 A/B тест создан: ${test.name}`);
    return test.id;
  }

  async startTest(testId: string): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error('Test not found');

    test.status = 'running';
    test.startDate = new Date();

    console.log(`▶️ A/B тест запущен: ${test.name}`);
  }

  getUserVariant(userId: string, testId: string): string | null {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') return null;

    // Проверяем существующее назначение
    const userAssignments = this.userAssignments.get(userId) || {};
    if (userAssignments[testId]) {
      return userAssignments[testId];
    }

    // Назначаем новый вариант
    const variant = this.assignVariant(userId, test);
    userAssignments[testId] = variant;
    this.userAssignments.set(userId, userAssignments);

    return variant;
  }

  private assignVariant(userId: string, test: ABTest): string {
    // Детерминированное назначение на основе userId
    const hash = this.hashUserId(userId, test.id);
    const bucket = hash % 100;

    let cumulative = 0;
    for (let i = 0; i < test.variants.length; i++) {
      cumulative += test.trafficSplit[i];
      if (bucket < cumulative) {
        return test.variants[i].id;
      }
    }

    return test.variants[0].id;
  }

  private hashUserId(userId: string, testId: string): number {
    let hash = 0;
    const str = userId + testId;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async recordConversion(userId: string, testId: string, metric: string, value: number = 1): Promise<void> {
    const variant = this.getUserVariant(userId, testId);
    if (!variant) return;

    await storage.recordSystemMetric({
      metricName: `ab_conversion_${testId}`,
      value: value.toString(),
      metadata: {
        userId,
        testId,
        variant,
        metric,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    });
  }

  async getTestResults(testId: string): Promise<ABTestResults | null> {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    // Получаем данные конверсий
    const conversions = await storage.getSystemMetrics(`ab_conversion_${testId}`, 720);
    
    const variantStats = new Map<string, { conversions: number; users: Set<string> }>();

    conversions.forEach(metric => {
      const variant = metric.metadata?.variant;
      const userId = metric.metadata?.userId;
      
      if (variant && userId) {
        if (!variantStats.has(variant)) {
          variantStats.set(variant, { conversions: 0, users: new Set() });
        }
        
        const stats = variantStats.get(variant)!;
        stats.conversions += parseFloat(metric.value) || 0;
        stats.users.add(userId);
      }
    });

    // Рассчитываем статистическую значимость
    const results = this.calculateStatisticalSignificance(variantStats);
    
    test.results = results;
    return results;
  }

  private calculateStatisticalSignificance(variantStats: Map<string, any>): ABTestResults {
    const variants = Array.from(variantStats.entries());
    if (variants.length < 2) {
      return {
        conversions: {},
        significance: 0,
        confidence: 0
      };
    }

    const conversions: Record<string, number> = {};
    let maxConversions = 0;
    let winner = '';

    variants.forEach(([variant, stats]) => {
      const rate = stats.users.size > 0 ? stats.conversions / stats.users.size : 0;
      conversions[variant] = rate;
      
      if (rate > maxConversions) {
        maxConversions = rate;
        winner = variant;
      }
    });

    // Упрощенный расчет статистической значимости
    const totalUsers = variants.reduce((sum, [, stats]) => sum + stats.users.size, 0);
    const significance = Math.min(0.99, totalUsers / 1000);
    const confidence = significance > 0.95 ? 95 : significance > 0.9 ? 90 : 80;

    return {
      conversions,
      significance,
      winner: significance > 0.95 ? winner : undefined,
      confidence
    };
  }

  // Автоматические A/B тесты для UI улучшений
  async createUITests(): Promise<void> {
    const uiTests = [
      {
        name: 'Button Color Test',
        description: 'Testing different button colors for conversion',
        variants: [
          { id: 'blue', name: 'Blue Button', config: { color: '#3b82f6' }, traffic: 50 },
          { id: 'green', name: 'Green Button', config: { color: '#10b981' }, traffic: 50 }
        ],
        metrics: ['click_rate', 'conversion_rate']
      },
      {
        name: 'Headlines Test',
        description: 'Testing different headline styles',
        variants: [
          { id: 'bold', name: 'Bold Headlines', config: { style: 'bold' }, traffic: 33 },
          { id: 'normal', name: 'Normal Headlines', config: { style: 'normal' }, traffic: 33 },
          { id: 'italic', name: 'Italic Headlines', config: { style: 'italic' }, traffic: 34 }
        ],
        metrics: ['engagement_rate', 'time_on_page']
      }
    ];

    for (const testConfig of uiTests) {
      const testId = await this.createTest(testConfig);
      await this.startTest(testId);
    }
  }

  getActiveTests(): ABTest[] {
    return Array.from(this.activeTests.values()).filter(test => test.status === 'running');
  }
}

export const abTestingService = new ABTestingService();
