import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Activity, Filter, Search, Star } from "lucide-react";

interface ExchangeData {
  nfts: Array<{
    id: string;
    title: string;
    price: number;
    lastPrice: number;
    change24h: number;
    volume24h: number;
    category: string;
    sentiment: string;
    verified: boolean;
    owner: string;
    image: string;
    bids: number;
    timeLeft?: string;
  }>;
  topGainers: Array<{
    id: string;
    title: string;
    price: number;
    change: number;
  }>;
  topLosers: Array<{
    id: string;
    title: string;
    price: number;
    change: number;
  }>;
  marketStats: {
    totalVolume24h: number;
    totalListings: number;
    activeTraders: number;
    avgPrice: number;
  };
}

export default function Exchange() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("volume");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const { data: exchangeData, isLoading } = useQuery<ExchangeData>({
    queryKey: ["/api/exchange"],
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredNfts = exchangeData?.nfts?.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || nft.category === selectedCategory;
    const matchesPrice = 
      (!priceRange.min || nft.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || nft.price <= parseFloat(priceRange.max));
    return matchesSearch && matchesCategory && matchesPrice;
  }) || [];

  const sortedNfts = [...filteredNfts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "change": return b.change24h - a.change24h;
      case "volume": return b.volume24h - a.volume24h;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Биржа новостных NFT</h1>
          <p className="text-xl text-muted-foreground">
            Торгуйте эксклюзивными новостными NFT в режиме реального времени
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Объем 24ч</p>
                  <p className="text-2xl font-bold">${exchangeData?.marketStats.totalVolume24h.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активные лоты</p>
                  <p className="text-2xl font-bold">{exchangeData?.marketStats.totalListings.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активные трейдеры</p>
                  <p className="text-2xl font-bold">{exchangeData?.marketStats.activeTraders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Средняя цена</p>
                  <p className="text-2xl font-bold">${exchangeData?.marketStats.avgPrice.toFixed(2)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trading Area */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Фильтры и поиск
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск NFT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {categories?.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volume">По объему</SelectItem>
                      <SelectItem value="price_desc">Цена: дорогие</SelectItem>
                      <SelectItem value="price_asc">Цена: дешевые</SelectItem>
                      <SelectItem value="change">По изменению</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Мин цена"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      type="number"
                    />
                    <Input
                      placeholder="Макс цена"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NFT Listings */}
            <div className="space-y-4">
              {sortedNfts.map((nft) => (
                <Card key={nft.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-6">
                    <img
                      src={nft.image}
                      alt={nft.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{nft.title}</h3>
                        {nft.verified && <Badge variant="secondary">✓ Верифицирован</Badge>}
                        <Badge variant={
                          nft.sentiment === 'positive' ? 'default' :
                          nft.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {nft.sentiment === 'positive' ? 'Позитивные' :
                           nft.sentiment === 'negative' ? 'Негативные' : 'Нейтральные'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Владелец: {nft.owner}</span>
                        <span>Категория: {nft.category}</span>
                        <span>{nft.bids} ставок</span>
                        {nft.timeLeft && <span>Осталось: {nft.timeLeft}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold">${nft.price}</span>
                        <div className={`flex items-center gap-1 ${
                          nft.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {nft.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="text-sm font-medium">
                            {nft.change24h >= 0 ? '+' : ''}{nft.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <div>Объем: ${nft.volume24h.toLocaleString()}</div>
                        <div>Последняя: ${nft.lastPrice}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm">Купить</Button>
                        <Button size="sm" variant="outline">Сделать ставку</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Gainers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  Топ роста
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exchangeData?.topGainers.map((nft) => (
                    <div key={nft.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{nft.title}</p>
                        <p className="text-sm font-bold">${nft.price}</p>
                      </div>
                      <div className="text-green-500 text-sm font-medium">
                        +{nft.change.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <TrendingDown className="h-5 w-5" />
                  Топ падения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exchangeData?.topLosers.map((nft) => (
                    <div key={nft.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{nft.title}</p>
                        <p className="text-sm font-bold">${nft.price}</p>
                      </div>
                      <div className="text-red-500 text-sm font-medium">
                        {nft.change.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Создать NFT из новости</Button>
                <Button variant="outline" className="w-full">Мой портфель</Button>
                <Button variant="outline" className="w-full">История торгов</Button>
                <Button variant="outline" className="w-full">Настроить алерты</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}