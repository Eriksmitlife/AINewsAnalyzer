
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface PerformanceMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  errorRate: number;
  throughput: number;
}

interface SystemHealth {
  uptime: number;
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  database: {
    connected: boolean;
    queryTime: number;
    activeConnections: number;
  };
  services: {
    ai: boolean;
    news: boolean;
    nft: boolean;
    trading: boolean;
  };
  performance: {
    averageResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

class MonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 10000;
  private startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private lastCleanup = Date.now();

  // Performance monitoring middleware
  trackRequest(req: Request, res: Response, next: Function) {
    const startTime = process.hrtime.bigint();
    const cpuStart = process.cpuUsage();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const cpuEnd = process.cpuUsage(cpuStart);

      this.requestCount++;
      if (res.statusCode >= 400) {
        this.errorCount++;
      }

      const metric: PerformanceMetrics = {
        timestamp: new Date(),
        endpoint: req.route?.path || req.path,
        method: req.method,
        responseTime,
        statusCode: res.statusCode,
        memoryUsage: process.memoryUsage(),
        cpuUsage: cpuEnd,
        activeConnections: this.getActiveConnections(),
        errorRate: this.calculateErrorRate(),
        throughput: this.calculateThroughput()
      };

      this.addMetric(metric);
      this.logSlowRequests(metric);
      this.cleanupOldMetrics();
    });

    next();
  }

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  private logSlowRequests(metric: PerformanceMetrics) {
    const slowThreshold = 1000; // 1 second
    if (metric.responseTime > slowThreshold) {
      console.warn(`🐌 Slow request detected: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    }
  }

  private cleanupOldMetrics() {
    const now = Date.now();
    if (now - this.lastCleanup > 300000) { // Cleanup every 5 minutes
      const cutoff = new Date(now - 3600000); // Keep last hour
      this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
      this.lastCleanup = now;
    }
  }

  private getActiveConnections(): number {
    // This would typically integrate with your server instance
    return 0; // Placeholder
  }

  private calculateErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return (this.errorCount / this.requestCount) * 100;
  }

  private calculateThroughput(): number {
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    return this.requestCount / uptimeSeconds;
  }

  // Get system health status
  async getSystemHealth(): Promise<SystemHealth> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    return {
      uptime,
      memory: {
        used: memUsage.heapUsed,
        free: memUsage.heapTotal - memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        loadAverage: [0, 0, 0] // Not available in Node.js on all platforms
      },
      database: {
        connected: await this.checkDatabaseHealth(),
        queryTime: await this.measureDatabaseQueryTime(),
        activeConnections: 0 // Would need database-specific implementation
      },
      services: {
        ai: await this.checkServiceHealth('ai'),
        news: await this.checkServiceHealth('news'),
        nft: await this.checkServiceHealth('nft'),
        trading: await this.checkServiceHealth('trading')
      },
      performance: {
        averageResponseTime: this.getAverageResponseTime(),
        requestsPerSecond: this.calculateThroughput(),
        errorRate: this.calculateErrorRate()
      }
    };
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Implement actual database health check
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async measureDatabaseQueryTime(): Promise<number> {
    const start = Date.now();
    try {
      // Implement simple query to measure response time
      await new Promise(resolve => setTimeout(resolve, 1)); // Placeholder
      return Date.now() - start;
    } catch (error) {
      return -1;
    }
  }

  private async checkServiceHealth(service: string): Promise<boolean> {
    try {
      // Implement service-specific health checks
      switch (service) {
        case 'ai':
          // Check AI service availability
          return true;
        case 'news':
          // Check news aggregation service
          return true;
        case 'nft':
          // Check NFT service
          return true;
        case 'trading':
          // Check trading service
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error(`${service} service health check failed:`, error);
      return false;
    }
  }

  private getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const recentMetrics = this.metrics.slice(-100); // Last 100 requests
    const total = recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return total / recentMetrics.length;
  }

  // Get detailed metrics for analytics
  getMetrics(limit = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // Get real-time statistics
  getRealTimeStats() {
    const recentMetrics = this.metrics.slice(-50);
    const now = Date.now();
    const fiveMinutesAgo = now - 300000;
    
    const recentRequests = this.metrics.filter(m => 
      m.timestamp.getTime() > fiveMinutesAgo
    );

    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.calculateErrorRate(),
      averageResponseTime: this.getAverageResponseTime(),
      requestsPerSecond: recentRequests.length / 300, // Last 5 minutes
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      activeEndpoints: this.getActiveEndpoints(),
      slowRequests: recentMetrics.filter(m => m.responseTime > 1000).length
    };
  }

  private getActiveEndpoints(): { [key: string]: number } {
    const endpoints: { [key: string]: number } = {};
    const recentMetrics = this.metrics.slice(-100);
    
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      endpoints[key] = (endpoints[key] || 0) + 1;
    });

    return endpoints;
  }

  // Alert system
  checkAlerts(): string[] {
    const alerts: string[] = [];
    const stats = this.getRealTimeStats();

    // High error rate alert
    if (stats.errorRate > 10) {
      alerts.push(`High error rate: ${stats.errorRate.toFixed(2)}%`);
    }

    // High response time alert
    if (stats.averageResponseTime > 2000) {
      alerts.push(`High response time: ${stats.averageResponseTime.toFixed(0)}ms`);
    }

    // High memory usage alert
    const memoryPercent = (stats.memoryUsage.heapUsed / stats.memoryUsage.heapTotal) * 100;
    if (memoryPercent > 80) {
      alerts.push(`High memory usage: ${memoryPercent.toFixed(1)}%`);
    }

    // Low throughput alert
    if (stats.requestsPerSecond < 0.1 && this.requestCount > 10) {
      alerts.push(`Low throughput: ${stats.requestsPerSecond.toFixed(2)} req/s`);
    }

    return alerts;
  }

  // Export metrics for external analysis
  exportMetrics(): string {
    return JSON.stringify({
      metadata: {
        exportTime: new Date().toISOString(),
        totalMetrics: this.metrics.length,
        timeRange: {
          start: this.metrics[0]?.timestamp,
          end: this.metrics[this.metrics.length - 1]?.timestamp
        }
      },
      statistics: this.getRealTimeStats(),
      systemHealth: this.getSystemHealth(),
      metrics: this.metrics
    }, null, 2);
  }
}

export const monitoringService = new MonitoringService();
