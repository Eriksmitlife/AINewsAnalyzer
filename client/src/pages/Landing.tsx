import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Newspaper, Palette, TrendingUp, Shield, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">AutoNews.AI</span>
            </div>
            <Button onClick={handleLogin} className="btn-primary">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              The Future of News is{" "}
              <span className="text-gradient">AI-Powered</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover breaking news with advanced AI analysis, sentiment detection, and fact-checking. 
              Create unique NFTs from articles and monetize content like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleLogin} size="lg" className="btn-primary text-lg px-8 py-3">
                Start Exploring
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced AI technology meets blockchain innovation to transform how you consume and interact with news.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Advanced sentiment analysis, fact-checking, and trend detection powered by cutting-edge AI models.
                </p>
                <Badge className="badge-category bg-blue-100 text-blue-800">
                  GPT-4 Powered
                </Badge>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Multi-Source Aggregation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Collect news from 50+ premium sources including TechCrunch, BBC, Reuters, and more.
                </p>
                <Badge className="badge-category bg-green-100 text-green-800">
                  50+ Sources
                </Badge>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  NFT Marketplace
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Create, buy, and sell unique NFTs generated from breaking news articles and trending stories.
                </p>
                <Badge className="badge-category bg-purple-100 text-purple-800">
                  Cross-Chain
                </Badge>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Monitor trends, sentiment patterns, and market dynamics with comprehensive analytics dashboards.
                </p>
                <Badge className="badge-category bg-orange-100 text-orange-800">
                  Live Data
                </Badge>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Fact Verification
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Advanced fact-checking algorithms to verify claims and detect misinformation automatically.
                </p>
                <Badge className="badge-category bg-red-100 text-red-800">
                  94% Accuracy
                </Badge>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Global Coverage
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Multi-language support and global news coverage to keep you informed about worldwide events.
                </p>
                <Badge className="badge-category bg-indigo-100 text-indigo-800">
                  Multilingual
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your News Experience?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who are already using AI to discover, analyze, and monetize news content.
          </p>
          <Button onClick={handleLogin} size="lg" className="btn-primary text-lg px-12 py-4">
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold">AutoNews.AI</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            © 2024 AutoNews.AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
