
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Shield, 
  Wallet, 
  TrendingUp, 
  Award,
  Coins,
  Calendar,
  Star
} from 'lucide-react';

export function AuthStatus() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Присоединяйтесь к AutoNews.AI
          </CardTitle>
          <CardDescription>
            Получите доступ ко всем возможностям платформы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>AI анализ</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>NFT торговля</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Достижения</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span>Рейтинги</span>
            </div>
          </div>
          
          <AuthModal>
            <Button className="w-full" size="lg">
              Начать работу
            </Button>
          </AuthModal>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-500" />
            Добро пожаловать!
          </div>
          <Badge variant="outline" className="text-green-600">
            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {user.level && (
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Уровень {user.level}</span>
            </div>
          )}
          
          {user.ancBalance && (
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>{parseFloat(user.ancBalance).toFixed(2)} ANC</span>
            </div>
          )}
          
          {user.walletAddress && (
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-blue-500" />
              <span>Web3</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Защищен</span>
          </div>
        </div>

        {user.totalEarnings && parseFloat(user.totalEarnings) > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-300">
                Общие доходы:
              </span>
              <span className="font-semibold text-green-600">
                {parseFloat(user.totalEarnings).toFixed(2)} ANC
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
