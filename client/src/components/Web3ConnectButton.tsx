import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Wallet, 
  Zap, 
  Shield, 
  Sparkles,
  ChevronRight,
  Check,
  Loader2
} from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';

export default function Web3ConnectButton() {
  const [showModal, setShowModal] = useState(false);
  const { 
    isConnected, 
    isLoading, 
    user, 
    connectors, 
    connectWallet, 
    disconnectWallet 
  } = useWeb3Auth();

  const walletOptions = [
    {
      id: 'metaMask',
      name: 'MetaMask',
      description: 'Самый популярный браузерный кошелек',
      icon: '🦊',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      description: 'Подключите любой мобильный кошелек',
      icon: '📱',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'coinbaseWallet',
      name: 'Coinbase Wallet',
      description: 'Безопасный кошелек от Coinbase',
      icon: '🔵',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'injected',
      name: 'Другие кошельки',
      description: 'Trust Wallet, Brave Wallet и другие',
      icon: '💼',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const handleConnect = async (connectorId: string) => {
    await connectWallet(connectorId);
    setShowModal(false);
  };

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Подключен
        </Badge>
        
        <div className="text-sm">
          <div className="text-gray-300">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </div>
          <div className="text-xs text-gray-500">
            Chain ID: {user.chainId}
          </div>
        </div>

        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Отключить
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Подключение...' : 'Подключить кошелек'}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Подключение кошелька</span>
            </div>
            <p className="text-sm font-normal text-gray-400">
              Выберите ваш криптовалютный кошелек для быстрого входа
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {walletOptions.map((wallet) => {
            const connector = connectors.find(c => 
              c.id.toLowerCase().includes(wallet.id.toLowerCase()) ||
              wallet.id === 'injected'
            );

            return (
              <Card 
                key={wallet.id}
                className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => handleConnect(wallet.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${wallet.color} flex items-center justify-center text-lg`}>
                        {wallet.icon}
                      </div>
                      
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {wallet.name}
                          {connector && (
                            <Check className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {wallet.description}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-purple-300 mb-1">
                Мгновенный доступ
              </div>
              <div className="text-gray-400 text-xs">
                Подключите кошелек один раз и получите полный доступ ко всем функциям AutoNews.AI без регистрации
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}