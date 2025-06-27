import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Target, 
  Activity, 
  Users, 
  Globe, 
  Rocket,
  Brain,
  Settings,
  BarChart3,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PromotionStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalEngagement: number;
  avgViralCoefficient: number;
  platformDistribution: { [key: string]: number };
  topPerformingCampaigns: any[];
  recentActivity: number;
}

interface EvolutionStats {
  evolutionMetrics: any[];
  pendingImprovements: number;
  recentInsights: any[];
  topPerformingMetrics: any[];
  criticalAreas: any[];
  overallEvolutionScore: number;
}

export default function AutomationControl() {
  const [isPromotionRunning, setIsPromotionRunning] = useState(false);
  const [isEvolutionRunning, setIsEvolutionRunning] = useState(false);
  const queryClient = useQueryClient();

  // Получение статистики автопродвижения
  const { data: promotionStats, isLoading: promotionLoading } = useQuery<PromotionStats>({
    queryKey: ["/api/promotion/stats"],
    refetchInterval: 30000,
  });

  // Получение статистики эволюции
  const { data: evolutionStats, isLoading: evolutionLoading } = useQuery<EvolutionStats>({
    queryKey: ["/api/evolution/stats"],
    refetchInterval: 30000,
  });

  // Запуск системы автопродвижения
  const startPromotionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/promotion/start"),
    onSuccess: () => {
      setIsPromotionRunning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/promotion/stats"] });
    }
  });

  // Запуск системы самоэволюции
  const startEvolutionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/evolution/start"),
    onSuccess: () => {
      setIsEvolutionRunning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/evolution/stats"] });
    }
  });

  // Автоматическая оптимизация системы
  const autoOptimizeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/system/auto-optimize"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evolution/stats"] });
    }
  });

  useEffect(() => {
    // Проверяем статус систем
    setIsPromotionRunning(promotionStats?.activeCampaigns > 0);
    setIsEvolutionRunning(evolutionStats?.pendingImprovements > 0);
  }, [promotionStats, evolutionStats]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Автономные Системы</h1>
          <p className="text-muted-foreground">
            Управление самомасштабирующимися системами автопродвижения и эволюции
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isPromotionRunning ? "default" : "secondary"}>
            <Bot className="w-4 h-4 mr-1" />
            Автопродвижение {isPromotionRunning ? 'Активно' : 'Неактивно'}
          </Badge>
          <Badge variant={isEvolutionRunning ? "default" : "secondary"}>
            <Brain className="w-4 h-4 mr-1" />
            Самоэволюция {isEvolutionRunning ? 'Активна' : 'Неактивна'}
          </Badge>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные кампании</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotionStats?.activeCampaigns || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              из {promotionStats?.totalCampaigns || 0} всего
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Охват аудитории</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(promotionStats?.totalReach || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Вирусный коэффициент: {promotionStats?.avgViralCoefficient.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Показатель эволюции</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((evolutionStats?.overallEvolutionScore || 0) * 100).toFixed(1)}%
            </div>
            <Progress 
              value={(evolutionStats?.overallEvolutionScore || 0) * 100} 
              className="w-full mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидающие улучшения</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evolutionStats?.pendingImprovements || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Автоматических улучшений
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="promotion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promotion">Автопродвижение</TabsTrigger>
          <TabsTrigger value="evolution">Самоэволюция</TabsTrigger>
          <TabsTrigger value="optimization">Оптимизация</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="promotion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Управление автопродвижением
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Статус системы</h4>
                    <p className="text-sm text-muted-foreground">
                      {isPromotionRunning ? 'Система активна и генерирует контент' : 'Система неактивна'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPromotionRunning ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => startPromotionMutation.mutate()}
                  disabled={startPromotionMutation.isPending || isPromotionRunning}
                  className="w-full"
                >
                  {startPromotionMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Запуск...
                    </>
                  ) : isPromotionRunning ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Система активна
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Запустить автопродвижение
                    </>
                  )}
                </Button>

                {promotionStats && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Статистика кампаний</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Общий охват: {formatNumber(promotionStats.totalReach)}</div>
                      <div>Вовлеченность: {formatNumber(promotionStats.totalEngagement)}</div>
                      <div>Недавняя активность: {promotionStats.recentActivity}</div>
                      <div>Топ кампаний: {promotionStats.topPerformingCampaigns.length}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Возможности автопродвижения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Многоплатформенное размещение</p>
                    <p className="text-sm text-muted-foreground">Twitter, Telegram, LinkedIn, Reddit, Discord</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Вирусный контент</p>
                    <p className="text-sm text-muted-foreground">ИИ создает мемы, челленджи и трендовый контент</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Работа с инфлюенсерами</p>
                    <p className="text-sm text-muted-foreground">Автоматический поиск и контакт с блогерами</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">SEO оптимизация</p>
                    <p className="text-sm text-muted-foreground">Автоматическое продвижение в поисковиках</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {promotionStats?.platformDistribution && (
            <Card>
              <CardHeader>
                <CardTitle>Распределение по платформам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(promotionStats.platformDistribution).map(([platform, count]) => (
                    <div key={platform} className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{platform}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Система самоэволюции
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Статус эволюции</h4>
                    <p className="text-sm text-muted-foreground">
                      Показатель: {((evolutionStats?.overallEvolutionScore || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Progress 
                    value={(evolutionStats?.overallEvolutionScore || 0) * 100} 
                    className="w-20" 
                  />
                </div>

                <Button 
                  onClick={() => startEvolutionMutation.mutate()}
                  disabled={startEvolutionMutation.isPending || isEvolutionRunning}
                  className="w-full"
                >
                  {startEvolutionMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Запуск...
                    </>
                  ) : isEvolutionRunning ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Система активна
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Запустить самоэволюцию
                    </>
                  )}
                </Button>

                {evolutionStats && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Метрики эволюции</h5>
                    <div className="space-y-1 text-sm">
                      <div>Ожидающие улучшения: {evolutionStats.pendingImprovements}</div>
                      <div>Последние insights: {evolutionStats.recentInsights.length}</div>
                      <div>Критические области: {evolutionStats.criticalAreas.length}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Последние insights</CardTitle>
              </CardHeader>
              <CardContent>
                {evolutionStats?.recentInsights.length > 0 ? (
                  <div className="space-y-2">
                    {evolutionStats.recentInsights.slice(0, 5).map((insight, index) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm">
                        <div className="font-medium">{insight.category}</div>
                        <div className="text-muted-foreground">{insight.insight}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Нет доступных insights</p>
                )}
              </CardContent>
            </Card>
          </div>

          {evolutionStats?.topPerformingMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Улучшающиеся метрики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {evolutionStats.topPerformingMetrics.slice(0, 4).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Важность: {(metric.importance * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {metric.currentValue.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          цель: {metric.targetValue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Автоматическая оптимизация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Запустите автоматическую оптимизацию всех систем платформы для улучшения производительности и пользовательского опыта.
              </p>

              <Button 
                onClick={() => autoOptimizeMutation.mutate()}
                disabled={autoOptimizeMutation.isPending}
                className="w-full"
                size="lg"
              >
                {autoOptimizeMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Оптимизация в процессе...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Запустить полную оптимизацию
                  </>
                )}
              </Button>

              <div className="grid gap-3 mt-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Оптимизация производительности</p>
                    <p className="text-sm text-muted-foreground">Автоматическое масштабирование и оптимизация БД</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Улучшение UX</p>
                    <p className="text-sm text-muted-foreground">A/B тестирование интерфейса и персонализация</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Оптимизация монетизации</p>
                    <p className="text-sm text-muted-foreground">Улучшение ценообразования и конверсии</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Общая статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Активные кампании:</span>
                    <span className="font-mono">{promotionStats?.activeCampaigns || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Общий охват:</span>
                    <span className="font-mono">{formatNumber(promotionStats?.totalReach || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Показатель эволюции:</span>
                    <span className="font-mono">{((evolutionStats?.overallEvolutionScore || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ожидающие улучшения:</span>
                    <span className="font-mono">{evolutionStats?.pendingImprovements || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статус систем</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Автопродвижение</span>
                    <Badge variant={isPromotionRunning ? "default" : "secondary"}>
                      {isPromotionRunning ? 'Активно' : 'Неактивно'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Самоэволюция</span>
                    <Badge variant={isEvolutionRunning ? "default" : "secondary"}>
                      {isEvolutionRunning ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Сбор новостей</span>
                    <Badge variant="default">Активен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ИИ анализ</span>
                    <Badge variant="default">Активен</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}