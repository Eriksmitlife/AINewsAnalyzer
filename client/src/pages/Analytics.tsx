import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, Zap, Brain, Users, Globe, BarChart3 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { data: marketPredictions } = useQuery({
    queryKey: ['market-predictions'],
    queryFn: () => fetch('/api/market/predictions').then(res => res.json()),
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: trendingTopics } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => fetch('/api/market/trending').then(res => res.json()),
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: realtimeStats } = useQuery({
    queryKey: ['realtime-stats'],
    queryFn: () => fetch('/api/realtime/stats').then(res => res.json()),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetch('/api/analytics').then(res => res.json()),
    refetchInterval: 30000
  });

  // Mock data for charts (replace with real data)
  const revenueData = [
    { name: 'Jan', revenue: 4000, nfts: 24, users: 120 },
    { name: 'Feb', revenue: 3000, nfts: 18, users: 98 },
    { name: 'Mar', revenue: 5000, nfts: 32, users: 156 },
    { name: 'Apr', revenue: 7800, nfts: 45, users: 201 },
    { name: 'May', revenue: 8900, nfts: 52, users: 234 },
    { name: 'Jun', revenue: 12543, nfts: 67, users: 298 },
  ];

  const categoryData = [
    { name: 'AI & Technology', value: 35, articles: 450 },
    { name: 'Finance & Crypto', value: 28, articles: 320 },
    { name: 'Startups', value: 20, articles: 240 },
    { name: 'Science', value: 12, articles: 180 },
    { name: 'Business', value: 5, articles: 90 },
  ];

  const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    users: Math.floor(Math.random() * 100) + 20,
    nftSales: Math.floor(Math.random() * 10),
    newsViews: Math.floor(Math.random() * 200) + 50
  }));

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

          <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          {realtimeStats && (
            <Badge variant="secondary">
              {realtimeStats.connectedClients} users online
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$12,543"
          change={12.5}
          icon="💰"
        />
        <StatsCard
          title="NFTs Sold"
          value="234"
          change={8.2}
          icon="🎨"
        />
        <StatsCard
          title="Active Users"
          value="1,429"
          change={-2.4}
          icon="👥"
        />
        <StatsCard
          title="AI Predictions"
          value="94.2%"
          change={2.1}
          icon="🧠"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue and NFT sales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Categories</CardTitle>
                <CardDescription>Distribution of news articles by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                24-Hour Activity
              </CardTitle>
              <CardDescription>User activity and engagement throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="Active Users" />
                  <Line type="monotone" dataKey="newsViews" stroke="#82ca9d" name="News Views" />
                  <Line type="monotone" dataKey="nftSales" stroke="#ffc658" name="NFT Sales" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Market Predictions
                </CardTitle>
                <CardDescription>AI-powered market sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketPredictions?.map((prediction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{prediction.category}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {prediction.factors?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          prediction.sentiment === 'bullish' ? 'default' :
                          prediction.sentiment === 'bearish' ? 'destructive' : 'secondary'
                        }>
                          {prediction.sentiment}
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI Performance
                </CardTitle>
                <CardDescription>Accuracy and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Sentiment Analysis Accuracy</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fact-Check Success Rate</span>
                    <span className="font-semibold">91.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trend Prediction Accuracy</span>
                    <span className="font-semibold">87.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time (avg)</span>
                    <span className="font-semibold">1.2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Trending Topics
              </CardTitle>
              <CardDescription>Real-time trending analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics?.slice(0, 9).map((topic: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{topic.keyword}</h4>
                      <Badge variant="outline">{topic.mentions}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Sentiment:</span>
                        <span className={
                          topic.sentimentScore > 0.6 ? 'text-green-600' :
                          topic.sentimentScore < 0.4 ? 'text-red-600' : 'text-gray-600'
                        }>
                          {Math.round(topic.sentimentScore * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Influence:</span>
                        <span>{Math.round(topic.influenceScore)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nfts" fill="#8884d8" name="NFTs Created" />
                    <Bar dataKey="users" fill="#82ca9d" name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>News Collection Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Articles Today:</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sources Active:</span>
                    <span className="font-semibold">9/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Speed:</span>
                    <span className="font-semibold">34 art/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-semibold">98.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Daily Active:</span>
                    <span className="font-semibold">1,429</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Active:</span>
                    <span className="font-semibold">8,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Session:</span>
                    <span className="font-semibold">12.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Rate:</span>
                    <span className="font-semibold">76.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}