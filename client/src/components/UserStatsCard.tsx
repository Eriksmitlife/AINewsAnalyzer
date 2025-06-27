
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Award, 
  Coins, 
  TrendingUp,
  Target,
  Calendar,
  Star
} from 'lucide-react';

export function UserStatsCard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const level = user.level || 1;
  const ancBalance = parseFloat(user.ancBalance || '0');
  const totalEarnings = parseFloat(user.totalEarnings || '0');
  
  // Прогресс до следующего уровня (пример)
  const currentLevelXP = level * 100;
  const nextLevelXP = (level + 1) * 100;
  const progressPercent = Math.min(75, (currentLevelXP / nextLevelXP) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Ваш профиль
        </CardTitle>
        <CardDescription>
          Статистика и достижения в AutoNews.AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Уровень и прогресс */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Уровень {level}</span>
            </div>
            <Badge variant="outline">
              {progressPercent.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            До следующего уровня осталось {100 - progressPercent.toFixed(0)}%
          </p>
        </div>

        {/* Баланс токенов */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>Баланс ANC</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {ancBalance.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Доходы</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <Target className="w-4 h-4 text-blue-500" />
            <div>
              <p className="font-medium">Задач выполнено</p>
              <p className="text-blue-600">12</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <Star className="w-4 h-4 text-purple-500" />
            <div>
              <p className="font-medium">Рейтинг</p>
              <p className="text-purple-600">4.8</p>
            </div>
          </div>
        </div>

        {/* Последняя активность */}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>Последний вход: сегодня</span>
        </div>
      </CardContent>
    </Card>
  );
}
