
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Bot, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap,
  Settings,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AutomationControl() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: automationStatus, refetch } = useQuery({
    queryKey: ["/api/automation/status"],
    refetchInterval: 10000, // Обновление каждые 10 секунд
    retry: false,
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/automation/metrics"],
    refetchInterval: 5000, // Метрики каждые 5 секунд
    retry: false,
  });

  const startAutomation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/automation/start'),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Система автоматизации запущена",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось запустить автоматизацию",
        variant: "destructive",
      });
    },
  });

  const stopAutomation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/automation/stop'),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Система автоматизации остановлена",
      });
      refetch();
    },
  });

  const restartAutomation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/automation/restart'),
    onSuccess: () => {
      toast({
        title: "Успешно", 
        description: "Система автоматизации перезапущена",
      });
      refetch();
    },
  });

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600" />
              Центр Автоматизации
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Полный контроль над автономными системами платформы
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${automationStatus?.isRunning ? 'bg-green-600' : 'bg-red-600'} text-white`}>
              <Activity className="w-3 h-3 mr-1" />
              {automationStatus?.isRunning ? 'Активна' : 'Остановлена'}
            </Badge>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
          </div>
        </div>

        {/* Главные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Задач Выполнено
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.tasksCompleted || 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ошибок Обработано
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {metrics?.errorsHandled || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Трафик Сгенерирован
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(metrics?.trafficGenerated || 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Доход Оптимизирован
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${Math.round(metrics?.revenueOptimized || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Управление */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Управление Автоматизацией
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => startAutomation.mutate()}
                disabled={automationStatus?.isRunning || startAutomation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Запустить Автоматизацию
              </Button>

              <Button
                onClick={() => stopAutomation.mutate()}
                disabled={!automationStatus?.isRunning || stopAutomation.isPending}
                variant="destructive"
              >
                <Pause className="w-4 h-4 mr-2" />
                Остановить Автоматизацию
              </Button>

              <Button
                onClick={() => restartAutomation.mutate()}
                disabled={restartAutomation.isPending}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Перезапустить
              </Button>
            </div>

            {automationStatus?.isRunning && (
              <Alert>
                <Activity className="w-4 h-4" />
                <AlertDescription>
                  Система автоматизации работает в автономном режиме. 
                  Активные модули: {automationStatus.activeIntervals?.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Статус модулей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                Сбор Новостей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Интервал:</span>
                  <span className="text-sm">3 мин</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Источников:</span>
                  <span className="text-sm">10/10</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Оптимизация Контента
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CTR улучшение:</span>
                  <span className="text-sm">+47%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SEO оптимизация:</span>
                  <span className="text-sm">Включена</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Генерация NFT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Создано сегодня:</span>
                  <span className="text-sm">23/50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Мин. трендинг:</span>
                  <span className="text-sm">0.7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                Трафик Оптимизация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Соц. сети:</span>
                  <span className="text-sm">Авто-постинг</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Увеличение:</span>
                  <span className="text-sm text-green-600">+234%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Защищено
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Угроз блок:</span>
                  <span className="text-sm">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Мониторинг:</span>
                  <span className="text-sm">24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Финансы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Авто-оптимизация:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Включена
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Доход/час:</span>
                  <span className="text-sm text-green-600">$127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ROI:</span>
                  <span className="text-sm text-green-600">+892%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Логи активности */}
        <Card>
          <CardHeader>
            <CardTitle>Последняя Активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[
                { time: '11:43:21', action: 'Собрано 96 новых статей', status: 'success' },
                { time: '11:43:15', action: 'Оптимизированы заголовки для CTR', status: 'success' },
                { time: '11:42:58', action: 'Создано 5 NFT из трендовых новостей', status: 'success' },
                { time: '11:42:45', action: 'Опубликовано в социальные сети', status: 'success' },
                { time: '11:42:30', action: 'Блокирован подозрительный IP', status: 'warning' },
                { time: '11:42:12', action: 'Оптимизированы цены NFT', status: 'success' },
                { time: '11:41:58', action: 'Обновлены мета-теги для SEO', status: 'success' },
                { time: '11:41:45', action: 'Выполнена очистка дубликатов', status: 'success' },
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border-l-4 border-l-green-500 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">{log.time}</span>
                    <span className="text-sm">{log.action}</span>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : 'secondary'}>
                    {log.status === 'success' ? 'Успешно' : 'Внимание'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
