import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Palette, 
  ExternalLink, 
  Brain, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Clock,
  Music,
  Play,
  Pause,
  Volume2,
  Zap,
  Share2,
  Bookmark
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    content?: string;
    summary?: string;
    category: string;
    publishedAt: string;
    sourceUrl?: string;
    viewCount?: number;
    sentiment?: string;
    aiScore?: number;
    imageUrl?: string;
    author?: string;
    tags?: string[];
    readingTime?: number;
  };
  compact?: boolean;
}

export default function NewsCard({ article, compact = false }: NewsCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest('DELETE', `/api/favorites/${article.id}`);
      } else {
        await apiRequest('POST', `/api/favorites/${article.id}`);
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Success",
        description: isFavorited ? "Removed from favorites" : "Added to favorites",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const generateNftMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/nfts/generate/${article.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "NFT generation started!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate NFT",
        variant: "destructive",
      });
    },
  });

  const generateMusicMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingMusic(true);
      return await apiRequest('POST', `/api/music/generate/${article.id}`);
    },
    onSuccess: (data) => {
      setIsGeneratingMusic(false);
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "Music Generated!",
        description: `Created ${data.style} music with ${data.mood} mood`,
      });
    },
    onError: (error) => {
      setIsGeneratingMusic(false);
      toast({
        title: "Error",
        description: "Failed to generate music",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200';
    }
  };

  const getSentimentText = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'Позитивные';
      case 'negative': return 'Негативные';
      case 'neutral': return 'Нейтральные';
      default: return 'Анализируется';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Business': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Science': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Politics': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'Health': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
      'Finance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  if (compact) {
    return (
      <Card className="news-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {article.imageUrl && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                  {article.category}
                </Badge>
                {article.sentiment && (
                  <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                    {getSentimentText(article.sentiment)}
                  </Badge>
                )}
                {article.readingTime && (
                  <Badge variant="outline" className="text-xs">
                    {article.readingTime} мин
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-2 hover:text-primary transition-colors cursor-pointer">
                {article.title}
              </h3>
              {article.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {article.summary}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.author && (
                    <span className="text-primary">• {article.author}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {(article.viewCount || 0).toLocaleString()}
                  </div>
                  {article.aiScore && (
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3 text-purple-500" />
                      {Math.round(article.aiScore * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="news-card hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              {article.sentiment && (
                <Badge className={getSentimentColor(article.sentiment)}>
                  {getSentimentText(article.sentiment)}
                </Badge>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 backdrop-blur-sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 backdrop-blur-sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {!article.imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getCategoryColor(article.category)}>
                  {article.category}
                </Badge>
                {article.sentiment && (
                  <Badge className={getSentimentColor(article.sentiment)}>
                    {getSentimentText(article.sentiment)}
                  </Badge>
                )}
                {article.aiScore && article.aiScore > 0.8 && (
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    <Brain className="w-3 h-3 mr-1" />
                    Высокий AI скор
                  </Badge>
                )}
              </div>
            )}
            <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
              {article.title}
            </CardTitle>
            {article.author && (
              <p className="text-sm text-muted-foreground mt-1">
                Автор: <span className="text-primary font-medium">{article.author}</span>
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {article.summary && (
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 3} еще
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <span>{formatDate(article.publishedAt)}</span>
            {article.readingTime && (
              <span>• {article.readingTime} мин чтения</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <Eye className="w-4 h-4" />
              {(article.viewCount || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Трендинг
            </div>
            {article.aiScore && (
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-purple-500" />
                AI: {Math.round(article.aiScore * 100)}%
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3">
          <Button size="sm" className="flex-1 gap-2">
            <ExternalLink className="w-4 h-4" />
            Читать полностью
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Palette className="w-4 h-4" />
            Создать NFT
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}