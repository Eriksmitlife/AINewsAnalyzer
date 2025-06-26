import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/StatsCard";
import { BarChart3, TrendingUp, Activity, Brain, Users, Globe } from "lucide-react";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: systemMetrics } = useQuery({
    queryKey: ["/api/analytics/system-metrics?hours=24"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Monitor platform performance and user engagement</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="badge-verified">
              <Activity className="w-3 h-3 mr-1" />
              Real-time Data
            </Badge>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Articles"
            value={stats?.totalArticles || 0}
            icon={<Activity className="w-5 h-5" />}
            bgColor="bg-blue-100 dark:bg-blue-900"
            iconColor="text-blue-600"
            trend="+12%"
          />
          <StatsCard
            title="NFTs Created"
            value={stats?.totalNfts || 0}
            icon={<BarChart3 className="w-5 h-5" />}
            bgColor="bg-purple-100 dark:bg-purple-900"
            iconColor="text-purple-600"
            trend="+8%"
          />
          <StatsCard
            title="Total Users"
            value="2,847"
            icon={<Users className="w-5 h-5" />}
            bgColor="bg-green-100 dark:bg-green-900"
            iconColor="text-green-600"
            trend="+23%"
          />
          <StatsCard
            title="AI Analyses"
            value={stats?.totalAnalyses || 0}
            icon={<Brain className="w-5 h-5" />}
            bgColor="bg-orange-100 dark:bg-orange-900"
            iconColor="text-orange-600"
            trend="+15%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Sentiment Analysis Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Positive Sentiment</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats?.avgSentimentScore || 0) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round((stats?.avgSentimentScore || 0) * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fact Check Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats?.avgFactCheckScore || 0) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round((stats?.avgFactCheckScore || 0) * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trending Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(stats?.avgTrendingScore || 0) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-orange-600">
                      {Math.round((stats?.avgTrendingScore || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Response Time</span>
                  <span className="text-sm font-mono text-green-600">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">News Sources Active</span>
                  <span className="text-sm font-mono text-blue-600">47/50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Model Accuracy</span>
                  <span className="text-sm font-mono text-purple-600">94.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                  <span className="text-sm font-mono text-orange-600">89.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-mono text-green-600">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "AI & Technology", count: 1247, color: "bg-blue-500" },
                  { name: "Finance & Crypto", count: 892, color: "bg-green-500" },
                  { name: "Startups", count: 634, color: "bg-purple-500" },
                  { name: "Science", count: 423, color: "bg-orange-500" },
                  { name: "Business", count: 298, color: "bg-red-500" },
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Global Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { country: "United States", users: 1247, flag: "🇺🇸" },
                  { country: "United Kingdom", users: 892, flag: "🇬🇧" },
                  { country: "Germany", users: 634, flag: "🇩🇪" },
                  { country: "France", users: 423, flag: "🇫🇷" },
                  { country: "Japan", users: 298, flag: "🇯🇵" },
                ].map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm text-gray-900 dark:text-white">{country.country}</span>
                    </div>
                    <span className="text-sm font-medium">{country.users}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>News Collection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Interactive charts showing news collection trends over time would be displayed here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
