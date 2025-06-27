import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, TrendingUp, BarChart3, Users, Globe, Eye, AlertTriangle } from "lucide-react";

export default function QuantumAI() {
  const { data: quantumStats } = useQuery({
    queryKey: ["/api/quantum/stats"],
    refetchInterval: 30000
  });

  const { data: metaverseStats } = useQuery({
    queryKey: ["/api/metaverse/stats"],
    refetchInterval: 30000
  });

  const { data: economyStats } = useQuery({
    queryKey: ["/api/economy/stats"],
    refetchInterval: 30000
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 text-purple-400" />
            Квантовый ИИ Центр
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Революционная система многомерного анализа с 4 ИИ-личностями, метавселенной и глобальной экономической аналитикой
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-purple-800/30 border-purple-500/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Квантовый Анализ</CardTitle>
              <Brain className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{quantumStats?.totalAnalyses || 0}</div>
              <p className="text-xs text-purple-300">
                Средний скор: {(quantumStats?.avgQuantumScore * 100)?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-500/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Метавселенная</CardTitle>
              <Globe className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metaverseStats?.totalActiveUsers || 0}</div>
              <p className="text-xs text-blue-300">
                Загруженность: {(metaverseStats?.utilizationRate * 100)?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-800/30 border-green-500/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Экономика</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{economyStats?.marketOpportunities || 0}</div>
              <p className="text-xs text-green-300">
                Риск: {(economyStats?.globalRiskLevel * 100)?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-800/30 border-orange-500/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-200">Алерты</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{economyStats?.criticalAlerts || 0}</div>
              <p className="text-xs text-orange-300">
                Статус: {economyStats?.economicSentiment || 'Анализ...'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="quantum" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/30">
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Квантовый ИИ
            </TabsTrigger>
            <TabsTrigger value="metaverse" className="data-[state=active]:bg-blue-600">
              <Globe className="w-4 h-4 mr-2" />
              Метавселенная
            </TabsTrigger>
            <TabsTrigger value="economy" className="data-[state=active]:bg-green-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Глобальная Экономика
            </TabsTrigger>
          </TabsList>

          {/* Quantum AI Tab */}
          <TabsContent value="quantum" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    ИИ Личности
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    4 уникальные ИИ-личности для многомерного анализа
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Alexis Quantum", expertise: "Квантовые вычисления, анализ рынка", confidence: 95 },
                    { name: "Marcus Prophet", expertise: "Экономическое прогнозирование, геополитика", confidence: 88 },
                    { name: "Sophia Neural", expertise: "Социальная динамика, вирусный контент", confidence: 92 },
                    { name: "Viktor Disruptor", expertise: "Инновации, технологические прорывы", confidence: 85 }
                  ].map((personality, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{personality.name}</span>
                        <Badge variant="secondary">{personality.confidence}% точность</Badge>
                      </div>
                      <p className="text-sm text-purple-300">{personality.expertise}</p>
                      <Progress value={personality.confidence} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Квантовые Показатели
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Многомерный анализ по 5 ключевым измерениям
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quantumStats?.dimensionalAverages && Object.entries(quantumStats.dimensionalAverages).map(([dimension, value]) => (
                    <div key={dimension} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white capitalize">{dimension === 'temporal' ? 'Временное' : 
                                                                  dimension === 'emotional' ? 'Эмоциональное' :
                                                                  dimension === 'social' ? 'Социальное' :
                                                                  dimension === 'economic' ? 'Экономическое' : 'Технологическое'}</span>
                        <span className="text-purple-300">{((value as number) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(value as number) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Высокоуровневые Анализы
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Анализы с квантовым скором выше 80%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-white">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    {quantumStats?.highImpactAnalyses || 0}
                  </div>
                  <p className="text-purple-300">Высокоимпактных анализов за 24 часа</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metaverse Tab */}
          <TabsContent value="metaverse" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Виртуальные Пространства
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    5 уникальных пространств метавселенной
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metaverseStats?.spaceBreakdown?.map((space: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{space.name}</span>
                        <Badge variant="outline" className="text-blue-300">
                          {space.activeUsers}/{space.capacity}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-300 capitalize">{space.type}</span>
                        <span className="text-blue-400">{space.utilization}</span>
                      </div>
                      <Progress value={parseFloat(space.utilization)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    ИИ Компаньоны
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Интерактивные ИИ персонажи для общения
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "Алекса Нейро", spec: "Новости и тренды", mood: "позитивное" },
                      { name: "Виктор Квант", spec: "Торговля и финансы", mood: "сосредоточенное" },
                      { name: "Лена Криэйтор", spec: "NFT и искусство", mood: "вдохновленное" },
                      { name: "Макс Исследователь", spec: "Наука и технологии", mood: "увлеченное" }
                    ].map((companion, index) => (
                      <div key={index} className="p-3 bg-blue-900/30 rounded-lg">
                        <h4 className="text-white font-medium">{companion.name}</h4>
                        <p className="text-xs text-blue-300">{companion.spec}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {companion.mood}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300">Активные События</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {metaverseStats?.activeEvents || 0}
                    </div>
                    <p className="text-blue-300">Событий прямо сейчас</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300">Предстоящие</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {metaverseStats?.upcomingEvents || 0}
                    </div>
                    <p className="text-blue-300">Событий запланировано</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Рыночные Возможности
                  </CardTitle>
                  <CardDescription className="text-green-200">
                    Топ инвестиционные возможности
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {economyStats?.topOpportunities?.map((opportunity: any, index: number) => (
                    <div key={index} className="p-3 bg-green-900/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-medium">{opportunity.asset}</span>
                        <Badge variant="secondary">
                          +{opportunity.expectedReturn?.toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-green-300 mb-1">{opportunity.market}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">Вероятность: {(opportunity.probability * 100)?.toFixed(0)}%</span>
                        <span className="text-green-400">Риск: {(opportunity.riskLevel * 100)?.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Экономические Индикаторы
                  </CardTitle>
                  <CardDescription className="text-green-200">
                    Глобальные экономические показатели
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {economyStats?.monitoredCountries || 0}
                      </div>
                      <p className="text-xs text-green-300">Стран мониторим</p>
                    </div>
                    <div className="text-center p-3 bg-green-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {economyStats?.highImpactNews || 0}
                      </div>
                      <p className="text-xs text-green-300">Высокоимпактных новостей</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white">Глобальный риск</span>
                      <span className="text-green-300">
                        {(economyStats?.globalRiskLevel * 100)?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress value={(economyStats?.globalRiskLevel || 0) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white">Средняя доходность</span>
                      <span className="text-green-300">
                        +{economyStats?.averageExpectedReturn?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress value={Math.min(100, (economyStats?.averageExpectedReturn || 0) * 2)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Экономический Статус
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {economyStats?.highProbabilityOpportunities || 0}
                    </div>
                    <p className="text-green-300 text-sm">Высоковероятных возможностей</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white capitalize">
                      {economyStats?.economicSentiment === 'positive' ? 'Позитивные' :
                       economyStats?.economicSentiment === 'negative' ? 'Негативные' : 'Нейтральные'}
                    </div>
                    <p className="text-green-300 text-sm">Настроения рынка</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">
                      {economyStats?.criticalAlerts || 0}
                    </div>
                    <p className="text-green-300 text-sm">Критических алертов</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
            <Eye className="w-4 h-4 mr-2" />
            Виртуальный Тур
          </Button>
          <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/20 px-8 py-3">
            <BarChart3 className="w-4 h-4 mr-2" />
            Экономический Отчет
          </Button>
        </div>
      </div>
    </div>
  );
}