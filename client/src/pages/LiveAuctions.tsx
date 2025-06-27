import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gavel, Clock, Users, TrendingUp, Flame, Star, Heart } from "lucide-react";

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  image: string;
  currentBid: number;
  startingBid: number;
  reservePrice?: number;
  endTime: string;
  category: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  bids: Array<{
    id: string;
    amount: number;
    bidder: {
      name: string;
      avatar: string;
    };
    timestamp: string;
  }>;
  totalBids: number;
  watchers: number;
  isHot: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
  aiScore: number;
}

interface LiveAuctionsData {
  featuredAuctions: AuctionItem[];
  endingSoon: AuctionItem[];
  mostWatched: AuctionItem[];
  recentlyStarted: AuctionItem[];
  categories: string[];
}

export default function LiveAuctions() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("ending_soon");
  const [bidAmount, setBidAmount] = useState("");
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);

  const { data: auctionsData, isLoading } = useQuery<LiveAuctionsData>({
    queryKey: ["/api/auctions", selectedCategory, sortBy],
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return "Завершен";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const getProgressPercentage = (endTime: string) => {
    const start = new Date().getTime() - (7 * 24 * 60 * 60 * 1000); // Предполагаем 7-дневный аукцион
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const handlePlaceBid = (auction: AuctionItem) => {
    const bid = parseFloat(bidAmount);
    if (bid <= auction.currentBid) {
      alert("Ставка должна быть выше текущей");
      return;
    }
    // Логика размещения ставки
    console.log('Placing bid:', { auctionId: auction.id, amount: bid });
    setBidAmount("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Живые аукционы NFT</h1>
          <p className="text-xl text-muted-foreground">
            Участвуйте в аукционах эксклюзивных новостных NFT в режиме реального времени
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select 
            className="px-4 py-2 border rounded-lg bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            {auctionsData?.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            className="px-4 py-2 border rounded-lg bg-background"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="ending_soon">Заканчиваются скоро</option>
            <option value="most_bids">Больше ставок</option>
            <option value="most_watched">Популярные</option>
            <option value="highest_bid">Высокие ставки</option>
            <option value="recently_started">Недавно начались</option>
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Горячие аукционы
          </Button>
        </div>

        {/* Featured Auctions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Рекомендуемые аукционы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctionsData?.featuredAuctions.map((auction) => (
              <Card key={auction.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {auction.isHot && (
                      <Badge className="bg-red-500 text-white">
                        <Flame className="h-3 w-3 mr-1" />
                        Горячий
                      </Badge>
                    )}
                    <Badge variant={
                      auction.sentiment === 'positive' ? 'default' :
                      auction.sentiment === 'negative' ? 'destructive' : 'secondary'
                    }>
                      {auction.sentiment === 'positive' ? 'Позитивные' :
                       auction.sentiment === 'negative' ? 'Негативные' : 'Нейтральные'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {getTimeRemaining(auction.endTime)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={auction.seller.avatar} />
                      <AvatarFallback>{auction.seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{auction.seller.name}</span>
                    {auction.seller.verified && <Star className="h-4 w-4 text-yellow-500" />}
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{auction.title}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Текущая ставка</span>
                      <span className="text-xl font-bold text-green-600">${auction.currentBid}</span>
                    </div>

                    <Progress value={getProgressPercentage(auction.endTime)} className="h-2" />

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {auction.totalBids} ставок
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {auction.watchers} наблюдают
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1"
                            onClick={() => setSelectedAuction(auction)}
                          >
                            <Gavel className="h-4 w-4 mr-2" />
                            Сделать ставку
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Сделать ставку на {auction.title}</DialogTitle>
                          </DialogHeader>
                          {selectedAuction && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <img
                                  src={selectedAuction.image}
                                  alt={selectedAuction.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Информация об аукционе</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Текущая ставка:</span>
                                        <span className="font-semibold">${selectedAuction.currentBid}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Минимальная ставка:</span>
                                        <span>${selectedAuction.currentBid + 5}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Время до окончания:</span>
                                        <span>{getTimeRemaining(selectedAuction.endTime)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Всего ставок:</span>
                                        <span>{selectedAuction.totalBids}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Ваша ставка ($)
                                    </label>
                                    <Input
                                      type="number"
                                      value={bidAmount}
                                      onChange={(e) => setBidAmount(e.target.value)}
                                      placeholder={`Минимум ${selectedAuction.currentBid + 5}`}
                                      min={selectedAuction.currentBid + 5}
                                    />
                                  </div>

                                  <Button 
                                    onClick={() => handlePlaceBid(selectedAuction)}
                                    className="w-full"
                                    disabled={!bidAmount || parseFloat(bidAmount) <= selectedAuction.currentBid}
                                  >
                                    Подтвердить ставку
                                  </Button>
                                </div>
                              </div>

                              {/* Recent Bids */}
                              <div>
                                <h4 className="font-semibold mb-4">Последние ставки</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                  {selectedAuction.bids.map((bid) => (
                                    <div key={bid.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={bid.bidder.avatar} />
                                          <AvatarFallback>{bid.bidder.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{bid.bidder.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(bid.timestamp).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="font-bold text-green-600">${bid.amount}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ending Soon */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-red-500" />
              Заканчиваются скоро
            </h2>
            <div className="space-y-4">
              {auctionsData?.endingSoon.map((auction) => (
                <Card key={auction.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{auction.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Ставка: ${auction.currentBid}</span>
                        <span>Осталось: {getTimeRemaining(auction.endTime)}</span>
                      </div>
                    </div>
                    <Button size="sm">
                      Ставка
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Most Watched */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              Самые популярные
            </h2>
            <div className="space-y-4">
              {auctionsData?.mostWatched.map((auction) => (
                <Card key={auction.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{auction.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Ставка: ${auction.currentBid}</span>
                        <span>{auction.watchers} наблюдают</span>
                      </div>
                    </div>
                    <Button size="sm">
                      Ставка
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}