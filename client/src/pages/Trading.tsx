import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Clock, Users, Gavel } from "lucide-react";

interface TradingData {
  orders: Array<{
    id: string;
    type: 'buy' | 'sell';
    nftTitle: string;
    price: number;
    quantity: number;
    total: number;
    user: string;
    timestamp: string;
    status: 'active' | 'filled' | 'cancelled';
  }>;
  myOrders: Array<{
    id: string;
    type: 'buy' | 'sell';
    nftTitle: string;
    price: number;
    quantity: number;
    status: 'active' | 'filled' | 'cancelled';
    timestamp: string;
  }>;
  recentTrades: Array<{
    id: string;
    nftTitle: string;
    price: number;
    quantity: number;
    buyer: string;
    seller: string;
    timestamp: string;
  }>;
  orderBook: {
    buyOrders: Array<{
      price: number;
      quantity: number;
      total: number;
    }>;
    sellOrders: Array<{
      price: number;
      quantity: number;
      total: number;
    }>;
  };
}

export default function Trading() {
  const [selectedNft, setSelectedNft] = useState("");
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderMode, setOrderMode] = useState<'market' | 'limit'>('limit');

  const { data: tradingData, isLoading } = useQuery<TradingData>({
    queryKey: ["/api/trading"],
  });

  const { data: availableNfts } = useQuery<Array<{id: string, title: string, currentPrice: number}>>({
    queryKey: ["/api/nfts/available"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-muted rounded-lg"></div>
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-80 bg-muted rounded-lg"></div>
                <div className="h-40 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    // Логика размещения ордера
    console.log('Placing order:', { selectedNft, orderType, price, quantity, orderMode });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Торговая площадка NFT</h1>
          <p className="text-xl text-muted-foreground">
            Профессиональная торговля новостными NFT с продвинутыми инструментами
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trading Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Book & Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Стакан заявок и график цен
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="orderbook" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="orderbook">Стакан заявок</TabsTrigger>
                    <TabsTrigger value="chart">График цен</TabsTrigger>
                    <TabsTrigger value="depth">Глубина рынка</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="orderbook" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Sell Orders */}
                      <div>
                        <h4 className="font-semibold mb-3 text-red-500">Заявки на продажу</h4>
                        <div className="space-y-2">
                          {tradingData?.orderBook.sellOrders.map((order, index) => (
                            <div key={index} className="flex justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                              <span className="text-red-600">${order.price}</span>
                              <span>{order.quantity}</span>
                              <span className="text-muted-foreground">${order.total}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Buy Orders */}
                      <div>
                        <h4 className="font-semibold mb-3 text-green-500">Заявки на покупку</h4>
                        <div className="space-y-2">
                          {tradingData?.orderBook.buyOrders.map((order, index) => (
                            <div key={index} className="flex justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm">
                              <span className="text-green-600">${order.price}</span>
                              <span>{order.quantity}</span>
                              <span className="text-muted-foreground">${order.total}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="chart">
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">График цен (интеграция TradingView)</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="depth">
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">График глубины рынка</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Последние сделки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NFT</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Покупатель</TableHead>
                      <TableHead>Продавец</TableHead>
                      <TableHead>Время</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradingData?.recentTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.nftTitle}</TableCell>
                        <TableCell className="text-green-600">${trade.price}</TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell>{trade.buyer}</TableCell>
                        <TableCell>{trade.seller}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* My Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Мои заявки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>NFT</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradingData?.myOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Badge variant={order.type === 'buy' ? 'default' : 'destructive'}>
                            {order.type === 'buy' ? 'Покупка' : 'Продажа'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{order.nftTitle}</TableCell>
                        <TableCell>${order.price}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'active' ? 'default' :
                            order.status === 'filled' ? 'default' : 'secondary'
                          }>
                            {order.status === 'active' ? 'Активна' :
                             order.status === 'filled' ? 'Исполнена' : 'Отменена'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === 'active' && (
                            <Button size="sm" variant="outline">Отменить</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Place Order */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Разместить заявку
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Выберите NFT</Label>
                  <select 
                    className="w-full p-2 border rounded-md mt-1"
                    value={selectedNft}
                    onChange={(e) => setSelectedNft(e.target.value)}
                  >
                    <option value="">Выберите NFT для торговли</option>
                    {availableNfts?.map(nft => (
                      <option key={nft.id} value={nft.id}>
                        {nft.title} - ${nft.currentPrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderType === 'buy' ? 'default' : 'outline'}
                    onClick={() => setOrderType('buy')}
                    className="w-full"
                  >
                    Купить
                  </Button>
                  <Button
                    variant={orderType === 'sell' ? 'destructive' : 'outline'}
                    onClick={() => setOrderType('sell')}
                    className="w-full"
                  >
                    Продать
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderMode === 'market' ? 'default' : 'outline'}
                    onClick={() => setOrderMode('market')}
                    size="sm"
                  >
                    Рыночная
                  </Button>
                  <Button
                    variant={orderMode === 'limit' ? 'default' : 'outline'}
                    onClick={() => setOrderMode('limit')}
                    size="sm"
                  >
                    Лимитная
                  </Button>
                </div>

                {orderMode === 'limit' && (
                  <div>
                    <Label>Цена ($)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label>Количество</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                {price && quantity && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Общая сумма:</span>
                      <span className="font-semibold">
                        ${(parseFloat(price) * parseFloat(quantity)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  className={`w-full ${orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  disabled={!selectedNft || !quantity || (orderMode === 'limit' && !price)}
                >
                  {orderType === 'buy' ? 'Разместить заявку на покупку' : 'Разместить заявку на продажу'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрая статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Активных заявок:</span>
                  <span className="font-semibold">{tradingData?.myOrders.filter(o => o.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Исполненных сделок:</span>
                  <span className="font-semibold">{tradingData?.myOrders.filter(o => o.status === 'filled').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Общий объем торгов:</span>
                  <span className="font-semibold">$12,450</span>
                </div>
              </CardContent>
            </Card>

            {/* Market Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Уведомления рынка</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Настроить алерты
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Настройка уведомлений</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>NFT для отслеживания</Label>
                        <select className="w-full p-2 border rounded-md mt-1">
                          <option>Выберите NFT</option>
                          {availableNfts?.map(nft => (
                            <option key={nft.id} value={nft.id}>{nft.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Цена для уведомления ($)</Label>
                        <Input type="number" placeholder="100.00" />
                      </div>
                      <div>
                        <Label>Тип уведомления</Label>
                        <select className="w-full p-2 border rounded-md mt-1">
                          <option>Цена выше</option>
                          <option>Цена ниже</option>
                          <option>Изменение объема</option>
                        </select>
                      </div>
                      <Button className="w-full">Создать алерт</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}