import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3, Settings, Plus, Minus } from "lucide-react";

interface PortfolioData {
  overview: {
    totalValue: number;
    totalChange24h: number;
    totalChangePercent24h: number;
    totalNfts: number;
    totalActiveListings: number;
    totalEarnings: number;
  };
  holdings: Array<{
    id: string;
    title: string;
    image: string;
    category: string;
    purchasePrice: number;
    currentPrice: number;
    change: number;
    changePercent: number;
    quantity: number;
    totalValue: number;
    isListed: boolean;
    listingPrice?: number;
    lastSaleDate: string;
  }>;
  transactions: Array<{
    id: string;
    type: 'buy' | 'sell' | 'mint';
    nftTitle: string;
    price: number;
    quantity: number;
    fee: number;
    total: number;
    counterparty: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
  earnings: Array<{
    date: string;
    amount: number;
    source: 'sale' | 'auction' | 'royalty';
  }>;
  performance: {
    bestPerformer: {
      title: string;
      gain: number;
      gainPercent: number;
    };
    worstPerformer: {
      title: string;
      loss: number;
      lossPercent: number;
    };
    totalProfit: number;
    totalProfitPercent: number;
  };
}

export default function Portfolio() {
  const [selectedNft, setSelectedNft] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [sellQuantity, setSellQuantity] = useState("");

  const { data: portfolioData, isLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleListNft = () => {
    console.log('Listing NFT:', { selectedNft, listingPrice, sellQuantity });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Мой портфель NFT</h1>
            <p className="text-xl text-muted-foreground">
              Управляйте своими цифровыми активами и отслеживайте доходность
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Выставить на продажу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Выставить NFT на продажу</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Выберите NFT</Label>
                    <Select value={selectedNft} onValueChange={setSelectedNft}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите NFT для продажи" />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolioData?.holdings.filter(h => !h.isListed).map(holding => (
                          <SelectItem key={holding.id} value={holding.id}>
                            {holding.title} (${holding.currentPrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Цена ($)</Label>
                    <Input
                      type="number"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Количество</Label>
                    <Input
                      type="number"
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <Button onClick={handleListNft} className="w-full">
                    Выставить на продажу
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Общая стоимость</p>
                  <p className="text-2xl font-bold">${portfolioData?.overview.totalValue.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-sm ${
                    (portfolioData?.overview.totalChangePercent24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(portfolioData?.overview.totalChangePercent24h || 0) >= 0 ? 
                      <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                    }
                    {portfolioData?.overview.totalChangePercent24h >= 0 ? '+' : ''}
                    {portfolioData?.overview.totalChangePercent24h.toFixed(2)}% (24ч)
                  </div>
                </div>
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Общее количество NFT</p>
                  <p className="text-2xl font-bold">{portfolioData?.overview.totalNfts}</p>
                  <p className="text-sm text-muted-foreground">
                    {portfolioData?.overview.totalActiveListings} выставлены
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Общий доход</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${portfolioData?.overview.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">За все время</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Прибыль/Убыток</p>
                  <p className={`text-2xl font-bold ${
                    (portfolioData?.performance.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(portfolioData?.performance.totalProfit || 0) >= 0 ? '+' : ''}
                    ${portfolioData?.performance.totalProfit.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    (portfolioData?.performance.totalProfitPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(portfolioData?.performance.totalProfitPercent || 0) >= 0 ? '+' : ''}
                    {portfolioData?.performance.totalProfitPercent.toFixed(2)}%
                  </p>
                </div>
                {(portfolioData?.performance.totalProfit || 0) >= 0 ? 
                  <TrendingUp className="h-8 w-8 text-green-500" /> : 
                  <TrendingDown className="h-8 w-8 text-red-500" />
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Лучший результат</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{portfolioData?.performance.bestPerformer.title}</p>
                  <p className="text-sm text-muted-foreground">Лучший исполнитель портфеля</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    +${portfolioData?.performance.bestPerformer.gain}
                  </p>
                  <p className="text-sm text-green-500">
                    +{portfolioData?.performance.bestPerformer.gainPercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Худший результат</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{portfolioData?.performance.worstPerformer.title}</p>
                  <p className="text-sm text-muted-foreground">Требует внимания</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">
                    -${portfolioData?.performance.worstPerformer.loss}
                  </p>
                  <p className="text-sm text-red-500">
                    {portfolioData?.performance.worstPerformer.lossPercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="holdings">Активы</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <Card>
              <CardHeader>
                <CardTitle>Мои NFT активы</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NFT</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Кол-во</TableHead>
                      <TableHead>Цена покупки</TableHead>
                      <TableHead>Текущая цена</TableHead>
                      <TableHead>Изменение</TableHead>
                      <TableHead>Общая стоимость</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioData?.holdings.map((holding) => (
                      <TableRow key={holding.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={holding.image}
                              alt={holding.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{holding.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(holding.lastSaleDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{holding.category}</Badge>
                        </TableCell>
                        <TableCell>{holding.quantity}</TableCell>
                        <TableCell>${holding.purchasePrice}</TableCell>
                        <TableCell>${holding.currentPrice}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${
                            holding.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {holding.changePercent >= 0 ? 
                              <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                            }
                            <span>
                              {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${holding.totalValue}</TableCell>
                        <TableCell>
                          {holding.isListed ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              На продаже ${holding.listingPrice}
                            </Badge>
                          ) : (
                            <Badge variant="outline">В портфеле</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!holding.isListed ? (
                              <Button size="sm" variant="outline">Продать</Button>
                            ) : (
                              <Button size="sm" variant="outline">Снять с продажи</Button>
                            )}
                            <Button size="sm" variant="outline">Подробнее</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>История транзакций</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>NFT</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Комиссия</TableHead>
                      <TableHead>Итого</TableHead>
                      <TableHead>Контрагент</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioData?.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge variant={
                            transaction.type === 'buy' ? 'default' :
                            transaction.type === 'sell' ? 'destructive' : 'secondary'
                          }>
                            {transaction.type === 'buy' ? 'Покупка' :
                             transaction.type === 'sell' ? 'Продажа' : 'Создание'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.nftTitle}</TableCell>
                        <TableCell>${transaction.price}</TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>${transaction.fee}</TableCell>
                        <TableCell className="font-semibold">${transaction.total}</TableCell>
                        <TableCell>{transaction.counterparty}</TableCell>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {transaction.status === 'completed' ? 'Завершена' :
                             transaction.status === 'pending' ? 'В обработке' : 'Неудача'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Распределение по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Круговая диаграмма категорий</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>История доходности</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolioData?.earnings.map((earning, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{earning.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {earning.source === 'sale' ? 'Продажа' :
                             earning.source === 'auction' ? 'Аукцион' : 'Роялти'}
                          </p>
                        </div>
                        <span className="font-bold text-green-600">+${earning.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>График стоимости портфеля</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Линейный график стоимости портфеля во времени</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}