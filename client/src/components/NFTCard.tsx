import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Palette, TrendingUp, Star, Award, Zap, Clock } from "lucide-react";

interface NFTCardProps {
  nft: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    creator?: string;
    category?: string;
    isForSale?: boolean;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    likes?: number;
    views?: number;
    timeLeft?: string;
    lastSale?: number;
    priceChange?: number;
    traits?: Array<{ name: string; value: string; rarity: number }>;
  };
  compact?: boolean;
}

export default function NFTCard({ nft, compact = false }: NFTCardProps) {
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500 border-yellow-500/50';
      case 'epic': return 'from-purple-400 to-pink-500 border-purple-500/50';
      case 'rare': return 'from-blue-400 to-cyan-500 border-blue-500/50';
      case 'common': return 'from-gray-400 to-gray-600 border-gray-500/50';
      default: return 'from-purple-400 to-pink-600 border-purple-500/50';
    }
  };

  const getRarityText = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'Легендарный';
      case 'epic': return 'Эпический';
      case 'rare': return 'Редкий';
      case 'common': return 'Обычный';
      default: return 'Уникальный';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return <Award className="w-4 h-4" />;
      case 'epic': return <Star className="w-4 h-4" />;
      case 'rare': return <Zap className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <Card className="news-card hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(nft.rarity)} rounded-lg flex items-center justify-center border-2`}>
              {nft.imageUrl ? (
                <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover rounded-md" />
              ) : (
                <Palette className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm line-clamp-1">{nft.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {getRarityIcon(nft.rarity)}
                  {getRarityText(nft.rarity)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate">
                  {nft.creator || 'Неизвестен'}
                </span>
                {nft.price && (
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs font-bold">
                      {nft.price} ETH
                    </Badge>
                    {nft.priceChange && (
                      <div className={`text-xs ${nft.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {nft.priceChange > 0 ? '+' : ''}{nft.priceChange.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="news-card hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <CardHeader className="pb-2">
        <div className={`relative aspect-square bg-gradient-to-br ${getRarityColor(nft.rarity)} rounded-lg flex items-center justify-center mb-3 border-2 overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
          {nft.imageUrl ? (
            <img 
              src={nft.imageUrl} 
              alt={nft.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Palette className="w-12 h-12 text-white" />
          )}

          {/* Overlay for rarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rarity badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`bg-gradient-to-r ${getRarityColor(nft.rarity).split(' ')[0]} ${getRarityColor(nft.rarity).split(' ')[1]} text-white border-0`}>
              {getRarityIcon(nft.rarity)}
              {getRarityText(nft.rarity)}
            </Badge>
          </div>

          {/* Heart button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 backdrop-blur-sm">
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Time left for auctions */}
          {nft.timeLeft && (
            <div className="absolute bottom-2 left-2 right-2">
              <Badge variant="secondary" className="w-full justify-center backdrop-blur-sm">
                <Clock className="w-3 h-3 mr-1" />
                {nft.timeLeft}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
            {nft.name}
          </CardTitle>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Создатель: <span className="text-primary font-medium">{nft.creator || 'Неизвестен'}</span>
            </span>
            {nft.category && (
              <Badge variant="outline" className="text-xs">
                {nft.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {nft.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {nft.description}
          </p>
        )}

        {/* Traits */}
        {nft.traits && nft.traits.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Характеристики</h5>
            <div className="grid grid-cols-2 gap-2">
              {nft.traits.slice(0, 4).map((trait, index) => (
                <div key={index} className="text-center p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">{trait.name}</div>
                  <div className="text-sm font-medium">{trait.value}</div>
                  <div className="text-xs text-primary">{(trait.rarity * 100).toFixed(1)}% редкость</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <Eye className="w-4 h-4" />
              {(nft.views || 123).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
              <Heart className="w-4 h-4" />
              {nft.likes || 45}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Топ
            </div>
          </div>
        </div>

        {/* Price section */}
        {nft.price && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Текущая цена:</span>
              <div className="text-right">
                <div className="text-xl font-bold">{nft.price} ETH</div>
                {nft.priceChange && (
                  <div className={`text-sm flex items-center gap-1 ${nft.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`w-3 h-3 ${nft.priceChange < 0 ? 'rotate-180' : ''}`} />
                    {nft.priceChange > 0 ? '+' : ''}{nft.priceChange.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {nft.lastSale && (
              <div className="text-xs text-muted-foreground">
                Последняя продажа: {nft.lastSale} ETH
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-3">
          <Button className="flex-1" size="sm">
            {nft.isForSale ? 'Купить сейчас' : 'Сделать предложение'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Детали
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}