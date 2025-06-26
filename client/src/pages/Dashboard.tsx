import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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

export default function Dashboard() {
  const { toast } = useToast();

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
    <main className="flex-1 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor your AI-powered news platform</p>
        </div>
        <Badge className="badge-verified">
          <Activity className="w-3 h-3 mr-1" />
          System Healthy
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Articles"
          value={stats?.totalArticles || 0}
          icon={<Activity className="w-5 h-5" />}
          bgColor="bg-blue-100 dark:bg-blue-900"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="NFTs Created"
          value={stats?.totalNfts || 0}
          icon={<Palette className="w-5 h-5" />}
          bgColor="bg-purple-100 dark:bg-purple-900"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Transactions"
          value={stats?.totalTransactions || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          bgColor="bg-green-100 dark:bg-green-900"
          iconColor="text-green-600"
        />
        <StatsCard
          title="AI Analyses"
          value={stats?.totalAnalyses || 0}
          icon={<Brain className="w-5 h-5" />}
          bgColor="bg-orange-100 dark:bg-orange-900"
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest News */}
        <div className="lg:col-span-2">
          <Card className="news-card">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Latest News</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {newsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="loading-spinner"></div>
                </div>
              ) : trendingNews && trendingNews.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trendingNews.map((article: any) => (
                    <NewsCard key={article.id} article={article} compact />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No trending news available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* AI Analysis Summary */}
          <AIAnalysisSummary stats={stats} />

          {/* Featured NFTs */}
          <Card className="news-card">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Featured NFTs</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View Market
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {nftsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="loading-spinner"></div>
                </div>
              ) : featuredNfts && featuredNfts.length > 0 ? (
                <div className="space-y-4">
                  {featuredNfts.map((nft: any) => (
                    <NFTCard key={nft.id} nft={nft} compact />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No NFTs available</p>
                </div>
              )}
            </CardContent>
          </Card>

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
