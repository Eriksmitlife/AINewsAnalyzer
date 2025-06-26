import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Shield, TrendingUp } from "lucide-react";

interface AIAnalysisSummaryProps {
  stats?: {
    avgSentimentScore: number;
    avgFactCheckScore: number;
    avgTrendingScore: number;
  };
}

export default function AIAnalysisSummary({ stats }: AIAnalysisSummaryProps) {
  const sentimentScore = (stats?.avgSentimentScore || 0) * 100;
  const factCheckScore = (stats?.avgFactCheckScore || 0) * 100;
  const trendingScore = (stats?.avgTrendingScore || 0) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="news-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Sentiment Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress 
                value={sentimentScore} 
                className="w-16 h-2"
              />
              <span className={`text-sm font-medium ${getScoreColor(sentimentScore)}`}>
                {Math.round(sentimentScore)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Fact Check Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress 
                value={factCheckScore} 
                className="w-16 h-2"
              />
              <span className={`text-sm font-medium ${getScoreColor(factCheckScore)}`}>
                {Math.round(factCheckScore)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Trending Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress 
                value={trendingScore} 
                className="w-16 h-2"
              />
              <span className={`text-sm font-medium ${getScoreColor(trendingScore)}`}>
                {Math.round(trendingScore)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Positive</p>
              <p className="text-sm font-semibold text-green-600">
                {Math.round(sentimentScore)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verified</p>
              <p className="text-sm font-semibold text-blue-600">
                {Math.round(factCheckScore)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hot</p>
              <p className="text-sm font-semibold text-orange-600">
                {Math.round(trendingScore)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
