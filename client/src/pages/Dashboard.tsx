import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatsCard from "@/components/StatsCard";
import NewsCard from "@/components/NewsCard";
import NFTCard from "@/components/NFTCard";
import AIAnalysisSummary from "@/components/AIAnalysisSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Download, Palette, TrendingUp, Activity } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { UserStatsCard } from "@/components/UserStatsCard";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { toast } = useToast();
  const [userLevel, setUserLevel] = useState(47);
  const [experience, setExperience] = useState(73);
  const [achievements, setAchievements] = useState([
    { id: 1, name: "News Master", icon: "🏆", unlocked: true },
    { id: 2, name: "AI Analyst", icon: "🧠", unlocked: true },
    { id: 3, name: "NFT Creator", icon: "🎨", unlocked: false },
  ]);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate XP gain
    const xpInterval = setInterval(() => {
      setExperience(prev => {
        const newXP = prev + 1;
        if (newXP >= 100) {
          const newLevel = userLevel + 1;
          setUserLevel(newLevel);
          // Use setTimeout to prevent state update during render
          setTimeout(() => {
            toast({
              title: "LEVEL UP!",
              description: `You've reached level ${newLevel}!`,
            });
          }, 0);
          return 0;
        }
        return newXP;
      });
    }, 2000);

    return () => clearInterval(xpInterval);
  }, [userLevel, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: trendingNews, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news/trending?limit=3"],
    retry: false,
  });

  const { data: featuredNfts, isLoading: nftsLoading } = useQuery({
    queryKey: ["/api/nfts?forSaleOnly=true&limit=3"],
    retry: false,
  });

  const { data: systemMetrics } = useQuery({
    queryKey: ["/api/analytics/system-metrics?hours=1"],
    retry: false,
  });

  useEffect(() => {
    const handleUnauthorized = (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    };

    if (statsLoading || newsLoading || nftsLoading) return;
  }, [statsLoading, newsLoading, nftsLoading, toast]);

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'generateNFT':
          if (trendingNews && trendingNews.length > 0) {
            await apiRequest('POST', `/api/nfts/generate/${trendingNews[0].id}`);
            toast({
              title: "Success",
              description: "NFT generation started!",
            });
          } else {
            toast({
              title: "No Articles",
              description: "No trending articles available for NFT generation.",
              variant: "destructive",
            });
          }
          break;
        case 'runAnalysis':
          if (trendingNews && trendingNews.length > 0) {
            await apiRequest('POST', `/api/ai/analyze/${trendingNews[0].id}`);
            toast({
              title: "Success",
              description: "AI analysis initiated!",
            });
          } else {
            toast({
              title: "No Articles",
              description: "No articles available for analysis.",
              variant: "destructive",
            });
          }
          break;
        case 'collectNews':
          await apiRequest('POST', '/api/admin/collect-news');
          toast({
            title: "Success",
            description: "News collection started!",
          });
          break;
        default:
          console.log('Action:', action);
      }
    } catch (error) {
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
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 fade-in">
      {/* Modern Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Панель управления
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Управляйте новостями и NFT в одном месте
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="status-dot success"></span>
              <span className="text-sm font-medium">Система активна</span>
            </div>
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg px-4 py-2 border border-indigo-500/20">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Уровень {userLevel}</div>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${experience}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{experience}/100 XP</div>
            </div>
          </div>
        </div>

        {/* Achievement Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Достижения:</span>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`tooltip px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
              data-tooltip={achievement.name}
            >
              {achievement.icon} {achievement.name}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => handleQuickAction('generateNFT')}
          className="action-card group h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <Palette className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Создать NFT</span>
        </button>

        <button 
          onClick={() => handleQuickAction('analyzeMarket')}
          className="action-card group h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <Brain className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Анализ ИИ</span>
        </button>

        <button className="action-card group h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
          <Download className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Экспорт</span>
        </button>

        <button className="action-card group h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform">
          <TrendingUp className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Аналитика</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Статьи</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? (
              <div className="skeleton h-8 w-20 rounded"></div>
            ) : (
              (stats?.totalArticles || 0).toLocaleString('ru-RU')
            )}
          </div>
          <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12% за день
          </div>
        </div>

        <div className="stat-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">NFT</span>
            <Palette className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? (
              <div className="skeleton h-8 w-20 rounded"></div>
            ) : (
              (stats?.totalNfts || 0).toLocaleString('ru-RU')
            )}
          </div>
          <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8% за день
          </div>
        </div>

        <div className="stat-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Сделки</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? (
              <div className="skeleton h-8 w-20 rounded"></div>
            ) : (
              (stats?.totalTransactions || 0).toLocaleString('ru-RU')
            )}
          </div>
          <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +15% за день
          </div>
        </div>

        <div className="stat-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Анализы ИИ</span>
            <Brain className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? (
              <div className="skeleton h-8 w-20 rounded"></div>
            ) : (
              (stats?.totalAnalyses || 0).toLocaleString('ru-RU')
            )}
          </div>
          <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +25% за день
          </div>
        </div>
      </div>

      {user && (
        <div className="grid gap-6 md:grid-cols-3">
          <UserStatsCard />
          <div className="md:col-span-2">
            <AIAnalysisSummary stats={stats} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest News */}
        <div className="lg:col-span-2">
          <div className="card-modern">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Последние новости</h2>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                Все новости →
              </Button>
            </div>
            {newsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-28 rounded-lg"></div>
                ))}
              </div>
            ) : trendingNews && Array.isArray(trendingNews) && trendingNews.length > 0 ? (
              <div className="space-y-4">
                {trendingNews.map((article: any) => (
                  <NewsCard key={article.id} article={article} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">Новости загружаются...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* AI Analysis Summary */}
          <div className="card-modern">
            <h3 className="text-lg font-semibold mb-4">ИИ Анализ</h3>
            <AIAnalysisSummary stats={stats} />
          </div>

          {/* Featured NFTs */}
          <div className="card-modern">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Топ NFT</h3>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                Рынок →
              </Button>
            </div>
            {nftsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-20 rounded-lg"></div>
                ))}
              </div>
            ) : featuredNfts && Array.isArray(featuredNfts) && featuredNfts.length > 0 ? (
              <div className="space-y-4">
                {featuredNfts.map((nft: any) => (
                  <NFTCard key={nft.id} nft={nft} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Palette className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">NFT загружаются...</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="gradient-primary text-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
                onClick={() => handleQuickAction('generateNFT')}
              >
                <Palette className="w-4 h-4 mr-2" />
                Generate NFT from Article
              </Button>
              <Button
                variant="secondary"
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
                onClick={() => handleQuickAction('runAnalysis')}
              >
                <Brain className="w-4 h-4 mr-2" />
                Run AI Analysis
              </Button>
              <Button
                variant="secondary"
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
                onClick={() => handleQuickAction('collectNews')}
              >
                <Download className="w-4 h-4 mr-2" />
                Collect Latest News
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Overview */}
      <Card className="news-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">API Response Time</p>
              <p className="text-lg font-mono text-green-600">142ms</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">News Sources Active</p>
              <p className="text-lg font-mono text-blue-600">47/50</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Model Accuracy</p>
              <p className="text-lg font-mono text-purple-600">94.7%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Blockchain Sync</p>
              <p className="text-lg font-mono text-green-600">Synced</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</p>
              <p className="text-lg font-mono text-orange-600">89.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}