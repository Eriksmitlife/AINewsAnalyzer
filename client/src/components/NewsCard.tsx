import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
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
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NewsCardProps {
  article: any;
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "AI & Technology": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Finance & Crypto": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Startups": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Science": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "Business": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  if (compact) {
    return (
      <article className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-start space-x-4">
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`badge-category ${getCategoryColor(article.category)}`}>
                {article.category}
              </Badge>
              {article.isVerified && (
                <Badge className="badge-verified">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {article.summary || article.content?.substring(0, 150) + '...'}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>{article.author || 'Unknown'}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(article.publishedAt || article.createdAt)}
                </span>
                {article.aiScore && (
                  <div className="flex items-center space-x-1">
                    <Brain className="w-3 h-3 text-purple-500" />
                    <span>AI Score: {Math.round(Number(article.aiScore) * 100)}%</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className="hover:text-red-600 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button 
                  onClick={() => generateNftMutation.mutate()}
                  disabled={generateNftMutation.isPending}
                  className="hover:text-blue-600 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const extractAds = (content: string) => {
    const adPattern = /\[AD\](.*?)(?=\n|$)/g;
    const ads = [];
    let match;

    while ((match = adPattern.exec(content)) !== null) {
      ads.push(match[1].trim());
    }

    return {
      ads,
      cleanContent: content.replace(adPattern, '').trim()
    };
  };

  const { ads, cleanContent } = extractAds(article.content || '');
  const summary = article.summary || cleanContent.substring(0, 200) + '...';

  return (
    <Card className="news-card">
      <CardContent className="p-6">
        {article.imageUrl && (
          <div className="mb-4">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`badge-category ${getCategoryColor(article.category)}`}>
              {article.category}
            </Badge>
            {article.isVerified && (
              <Badge className="badge-verified">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {Number(article.trendingScore) > 0.7 && (
              <Badge className="badge-trending">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {article.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
            {summary}
          </p>

          {ads.length > 0 && (
            <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Спонсорский контент</span>
              </div>
              {ads.map((ad, index) => (
                <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                  {ad}
                </p>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{article.author || 'Unknown'}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(article.publishedAt || article.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount || 0}
              </span>
            </div>
          </div>

          {(article.aiScore || article.sentimentScore || article.factCheckScore) && (
            <div className="flex items-center gap-4 text-xs">
              {article.aiScore && (
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-500" />
                  <span>AI: {Math.round(Number(article.aiScore) * 100)}%</span>
                </div>
              )}
              {article.sentimentScore && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    article.sentiment === 'positive' ? 'bg-green-500' : 
                    article.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span>Sentiment: {Math.round(Number(article.sentimentScore) * 100)}%</span>
                </div>
              )}
              {article.factCheckScore && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  <span>Fact: {Math.round(Number(article.factCheckScore) * 100)}%</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                className={`hover:text-red-600 ${isFavorited ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isFavorited ? 'fill-red-500' : ''}`} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateNftMutation.mutate()}
                disabled={generateNftMutation.isPending}
                className="hover:text-blue-600"
              >
                <Palette className="w-4 h-4 mr-1" />
                Create NFT
              </Button>

              {article.musicUrl ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(article.musicUrl, '_blank')}
                  className="hover:text-purple-600"
                  title={`${article.musicStyle} music - ${article.musicMood} mood`}
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Play Music
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateMusicMutation.mutate()}
                  disabled={isGeneratingMusic}
                  className="hover:text-purple-600"
                >
                  {isGeneratingMusic ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-1" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 mr-1" />
                      Generate Music
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(article.url, '_blank')}
              className="hover:text-blue-600"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Read More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}