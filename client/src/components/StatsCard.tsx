import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  trend?: string;
  subtitle?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  iconColor, 
  trend,
  subtitle 
}: StatsCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = (trendValue?: string) => {
    if (!trendValue) return "";
    const isPositive = trendValue.startsWith('+');
    return isPositive ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = (trendValue?: string) => {
    if (!trendValue) return null;
    const isPositive = trendValue.startsWith('+');
    return isPositive ? 
      <TrendingUp className="w-3 h-3" /> : 
      <TrendingDown className="w-3 h-3" />;
  };

  return (
    <Card className="stats-card card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 ${bgColor} rounded-lg`}>
              <div className={iconColor}>
                {icon}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {trend && (
            <Badge 
              variant="secondary" 
              className={`${getTrendColor(trend)} bg-transparent border-0 flex items-center gap-1`}
            >
              {getTrendIcon(trend)}
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
