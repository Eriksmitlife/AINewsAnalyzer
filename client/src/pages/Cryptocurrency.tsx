import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  Send, 
  ArrowLeftRight, 
  Layers, 
  Zap, 
  Shield,
  Globe,
  BarChart3,
  Users,
  Clock,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BlockchainStats {
  totalBlocks: number;
  totalSupply: number;
  circulatingSupply: number;
  stakingApy: number;
  avgBlockTime: number;
  networkHashrate: string;
  energyEfficiency: string;
  transactionSpeed: string;
  crossChainSupport: string[];
  securityLevel: string;
}

interface WalletInfo {
  address: string;
  publicKey: string;
  balance: number;
  stakingBalance: number;
  message?: string;
}

interface PriceData {
  symbol: string;
  name: string;
  usd: number;
  btc: number;
  eth: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  last_updated: string;
}

export default function Cryptocurrency() {
  const [walletAddress, setWalletAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const queryClient = useQueryClient();

  // Получение статистики блокчейна
  const { data: blockchainStats, isLoading: statsLoading } = useQuery<BlockchainStats>({
    queryKey: ["/api/anc/blockchain/stats"],
    refetchInterval: 30000, // Обновление каждые 30 секунд
  });

  // Получение цены ANC
  const { data: priceData, isLoading: priceLoading } = useQuery<PriceData>({
    queryKey: ["/api/anc/price"],
    refetchInterval: 10000, // Обновление каждые 10 секунд
  });

  // Получение баланса кошелька
  const { data: walletBalance } = useQuery<{ address: string; balance: number; stakingBalance: number }>({
    queryKey: [`/api/anc/wallet/${walletAddress}/balance`],
    enabled: !!walletAddress,
    refetchInterval: 15000,
  });

  // Создание кошелька
  const createWalletMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/anc/wallet/create"),
    onSuccess: async (response) => {
      const wallet: WalletInfo = await response.json();
      setWalletAddress(wallet.address);
      queryClient.invalidateQueries({ queryKey: ["/api/anc/blockchain/stats"] });
    }
  });

  // Перевод токенов
  const transferMutation = useMutation({
    mutationFn: (data: { to: string; amount: number; privateKey: string }) =>
      apiRequest("POST", "/api/anc/transfer", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/anc/wallet/${walletAddress}/balance`] });
      setTransferAmount("");
      setTransferTo("");
      setPrivateKey("");
    }
  });

  // Стейкинг токенов
  const stakeMutation = useMutation({
    mutationFn: (data: { amount: number }) =>
      apiRequest("POST", "/api/anc/stake", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/anc/wallet/${walletAddress}/balance`] });
      setStakeAmount("");
    }
  });

  const handleCreateWallet = () => {
    createWalletMutation.mutate();
  };

  const handleTransfer = () => {
    if (!transferTo || !transferAmount || !privateKey) return;
    
    transferMutation.mutate({
      to: transferTo,
      amount: parseFloat(transferAmount),
      privateKey
    });
  };

  const handleStake = () => {
    if (!stakeAmount) return;
    
    stakeMutation.mutate({
      amount: parseFloat(stakeAmount)
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AutoNews Coin (ANC)</h1>
          <p className="text-muted-foreground">
            Революционная энергоэффективная криптовалюта с кросс-чейн поддержкой
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-green-600">
            <Zap className="w-4 h-4 mr-1" />
            99.9% Energy Efficient
          </Badge>
          <Badge variant="secondary" className="text-blue-600">
            <Shield className="w-4 h-4 mr-1" />
            Quantum Resistant
          </Badge>
        </div>
      </div>

      {/* Статистика блокчейна */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Цена ANC</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${priceData?.usd.toFixed(2) || "12.50"}
            </div>
            <p className={`text-xs ${(priceData?.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(priceData?.change24h || 0) >= 0 ? '+' : ''}{priceData?.change24h.toFixed(2) || '0.00'}% за 24ч
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рыночная капитализация</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((priceData?.marketCap || 12500000000) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Объем 24ч: ${((priceData?.volume24h || 10000000) / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Скорость сети</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50,000 TPS</div>
            <p className="text-xs text-muted-foreground">
              Время блока: {blockchainStats?.avgBlockTime || 12} сек
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Стейкинг APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <p className="text-xs text-muted-foreground">
              Энергопотребление: -99.9% vs Bitcoin
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallet">Кошелек</TabsTrigger>
          <TabsTrigger value="staking">Стейкинг</TabsTrigger>
          <TabsTrigger value="bridge">Кросс-чейн</TabsTrigger>
          <TabsTrigger value="mining">Майнинг</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Мой кошелек ANC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!walletAddress ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Создайте кошелек для начала работы с ANC
                    </p>
                    <Button 
                      onClick={handleCreateWallet}
                      disabled={createWalletMutation.isPending}
                      className="w-full"
                    >
                      {createWalletMutation.isPending ? "Создание..." : "Создать кошелек"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Адрес кошелька</Label>
                      <Input value={walletAddress} readOnly className="font-mono text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Баланс</Label>
                        <div className="text-2xl font-bold">
                          {walletBalance?.balance || 0} ANC
                        </div>
                      </div>
                      <div>
                        <Label>В стейкинге</Label>
                        <div className="text-2xl font-bold text-green-600">
                          {walletBalance?.stakingBalance || 0} ANC
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Перевод ANC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Адрес получателя</Label>
                  <Input
                    placeholder="anc1234..."
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Количество ANC</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Приватный ключ</Label>
                  <Input
                    type="password"
                    placeholder="Введите приватный ключ"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTransfer}
                  disabled={transferMutation.isPending || !walletAddress}
                  className="w-full"
                >
                  {transferMutation.isPending ? "Отправка..." : "Отправить"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Стейкинг ANC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Количество для стейкинга</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">
                    Доходность стейкинга
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-green-600">APY</p>
                      <p className="text-xl font-bold text-green-700">12%</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Дневной доход</p>
                      <p className="text-xl font-bold text-green-700">
                        {stakeAmount ? ((parseFloat(stakeAmount) * 0.12) / 365).toFixed(4) : "0.0000"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleStake}
                  disabled={stakeMutation.isPending || !walletAddress}
                  className="w-full"
                >
                  {stakeMutation.isPending ? "Размещение..." : "Разместить в стейкинг"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Преимущества стейкинга ANC</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Высокая доходность</p>
                    <p className="text-sm text-muted-foreground">12% годовых без блокировки</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Мгновенные награды</p>
                    <p className="text-sm text-muted-foreground">Награды начисляются каждый блок</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Квантовая защита</p>
                    <p className="text-sm text-muted-foreground">Защищено от квантовых компьютеров</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bridge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Кросс-чейн мосты
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Переводите ANC между различными блокчейнами
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {["Ethereum", "Polygon", "BSC", "Solana", "Cardano"].map((chain) => (
                  <Card key={chain} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{chain}</h4>
                        <p className="text-sm text-muted-foreground">Комиссия: 0.1%</p>
                      </div>
                      <Button size="sm">Мост</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mining" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Статистика майнинга
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Сложность сети</Label>
                    <div className="text-2xl font-bold">
                      {blockchainStats?.avgBlockTime || 4}
                    </div>
                  </div>
                  <div>
                    <Label>Награда за блок</Label>
                    <div className="text-2xl font-bold">50 ANC</div>
                  </div>
                </div>
                <div>
                  <Label>Хешрейт сети</Label>
                  <div className="text-2xl font-bold">1.2 PH/s</div>
                </div>
                <div>
                  <Label>Энергоэффективность</Label>
                  <Progress value={99.9} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-1">
                    99.9% эффективнее Bitcoin
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Валидаторы сети
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Validator #1</p>
                      <p className="text-sm text-muted-foreground">Стейк: 100,000 ANC</p>
                    </div>
                    <Badge variant="secondary">99.8% Uptime</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Validator #2</p>
                      <p className="text-sm text-muted-foreground">Стейк: 85,000 ANC</p>
                    </div>
                    <Badge variant="secondary">99.7% Uptime</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Общая статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Всего блоков:</span>
                  <span className="font-mono">{blockchainStats?.totalBlocks.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Общий запас:</span>
                  <span className="font-mono">{blockchainStats?.totalSupply.toLocaleString() || "1,000,000,000"}</span>
                </div>
                <div className="flex justify-between">
                  <span>В обращении:</span>
                  <span className="font-mono">{blockchainStats?.circulatingSupply.toLocaleString() || "0"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Производительность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>TPS:</span>
                  <span className="font-mono text-green-600">50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Время блока:</span>
                  <span className="font-mono">12 сек</span>
                </div>
                <div className="flex justify-between">
                  <span>Финальность:</span>
                  <span className="font-mono">3 сек</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Экология</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Энергоэффективность:</span>
                  <span className="font-mono text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Углеродный след:</span>
                  <span className="font-mono text-green-600">-99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Алгоритм:</span>
                  <span className="font-mono">Quantum PoS</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}