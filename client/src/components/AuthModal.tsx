
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { User, Wallet, Shield, Globe, Zap } from 'lucide-react';

interface AuthModalProps {
  children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authTab, setAuthTab] = useState('replit');
  const { loginWithReplit, loginWithWeb3, registerWithWeb3 } = useAuth();
  const { connectWallet, isConnecting, account, chainId } = useWeb3Auth();

  const handleReplitLogin = () => {
    loginWithReplit();
    setIsOpen(false);
  };

  const handleWeb3Login = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    const result = await loginWithWeb3(account, chainId || 1);
    if (result.success) {
      setIsOpen(false);
    } else {
      // Если пользователь не найден, предлагаем регистрацию
      const registerResult = await registerWithWeb3(account, 'signature', 'message', chainId || 1);
      if (registerResult.success) {
        setIsOpen(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Добро пожаловать в AutoNews.AI
          </DialogTitle>
        </DialogHeader>

        <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="replit" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Replit Auth
            </TabsTrigger>
            <TabsTrigger value="web3" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Web3 Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="replit" className="space-y-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Replit Authentication
                </CardTitle>
                <CardDescription>
                  Безопасная аутентификация через платформу Replit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-500" />
                    <span>Профиль Replit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Защищенные сессии</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span>Глобальный доступ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span>Быстрый вход</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleReplitLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Войти через Replit
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  Используя Replit Auth, вы получите доступ ко всем функциям платформы
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="web3" className="space-y-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-500" />
                  Web3 Wallet Authentication
                </CardTitle>
                <CardDescription>
                  Подключите криптокошелек для доступа к блокчейн-функциям
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {account && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Кошелек подключен:</span>
                    </div>
                    <div className="text-xs text-green-600 font-mono mt-1">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      Chain ID: {chainId}
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-500" />
                    <span>NFT торговля</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span>ANC токены</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span>DeFi функции</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span>Децентрализация</span>
                  </div>
                </div>

                <Button 
                  onClick={handleWeb3Login}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Подключение...' : account ? 'Войти с кошельком' : 'Подключить кошелек'}
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  Поддерживаются MetaMask, WalletConnect и другие Web3 кошельки
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Регистрируясь, вы соглашаетесь с нашими правилами использования
        </div>
      </DialogContent>
    </Dialog>
  );
}
