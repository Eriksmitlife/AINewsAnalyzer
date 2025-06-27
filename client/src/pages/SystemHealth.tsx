
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  TrendingUp,
  Zap,
  Server,
  Database,
  Wifi
} from "lucide-react";
import { apiRequest } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function SystemHealth() {
  const { toast } = useToast();
  const [isRestarting, setIsRestarting] = useState(false);

  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  });

  const handleRestartCollection = async () => {
    setIsRestarting(true);
    try {
      await apiRequest('POST', '/api/admin/restart-collection');
      toast({
        title: "Success",
        description: "News collection system restarted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restart collection system",
        variant: "destructive",
      });
    } finally {
      setIsRestarting(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const newsCollection = healthData?.newsCollection || {};
  const isHealthy = healthData?.status === 'healthy';
  const hasErrors = (newsCollection.errorCount || 0) > 0;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Health Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              24/7 News Collection System Status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleRestartCollection}
              disabled={isRestarting}
              variant="destructive"
              size="sm"
            >
              <Server className="w-4 h-4 mr-2" />
              {isRestarting ? 'Restarting...' : 'Restart Collection'}
            </Button>
          </div>
        </div>

        {/* System Status Alert */}
        <Alert className={isHealthy ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}>
          {isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={isHealthy ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
            System Status: {isHealthy ? 'All systems operational' : 'System experiencing issues'}
            {hasErrors && ` (${newsCollection.errorCount} recent errors)`}
          </AlertDescription>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.uptime ? formatUptime(healthData.uptime) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Since last restart
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Status</CardTitle>
              <Activity className={`w-4 h-4 ${newsCollection.isCollecting ? 'text-green-600' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={newsCollection.isCollecting ? "default" : "secondary"}>
                  {newsCollection.isCollecting ? 'Active' : 'Idle'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Collection interval: {Math.floor((newsCollection.collectionInterval || 300000) / 60000)}min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Count</CardTitle>
              <AlertCircle className={`w-4 h-4 ${hasErrors ? 'text-red-600' : 'text-green-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newsCollection.errorCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Max allowed: {newsCollection.maxErrors || 5}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Database className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData?.memory ? formatMemory(healthData.memory.heapUsed) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {healthData?.memory ? formatMemory(healthData.memory.heapTotal) : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>News Collection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Last Successful Collection:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {newsCollection.lastSuccessfulCollection 
                      ? new Date(newsCollection.lastSuccessfulCollection).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Collection Frequency:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Every {Math.floor((newsCollection.collectionInterval || 300000) / 60000)} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Error Threshold:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {newsCollection.errorCount || 0} / {newsCollection.maxErrors || 5}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Environment:</span>
                  <Badge variant="outline">
                    {healthData?.env || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthData?.memory && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Heap Used:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMemory(healthData.memory.heapUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Heap Total:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMemory(healthData.memory.heapTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">External:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMemory(healthData.memory.external)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">RSS:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMemory(healthData.memory.rss)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleTimeString()} - Health check completed
                </span>
              </div>
              {newsCollection.lastSuccessfulCollection && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(newsCollection.lastSuccessfulCollection).toLocaleTimeString()} - News collection completed
                  </span>
                </div>
              )}
              {hasErrors && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {newsCollection.errorCount} collection errors detected
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
