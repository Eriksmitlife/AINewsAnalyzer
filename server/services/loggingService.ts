
import * as fs from 'fs';
import * as path from 'path';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  stack?: string;
  metadata?: any;
}

interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error;
  context: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  tags: string[];
}

class LoggingService {
  private logs: LogEntry[] = [];
  private errorReports: ErrorReport[] = [];
  private maxLogHistory = 50000;
  private currentLogLevel = LogLevel.INFO;
  private logDirectory = path.join(process.cwd(), 'logs');

  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  setLogLevel(level: LogLevel) {
    this.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private addLog(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    this.logs.push(entry);
    
    // Maintain log history limit
    if (this.logs.length > this.maxLogHistory) {
      this.logs = this.logs.slice(-this.maxLogHistory);
    }

    // Write to file for persistent logging
    this.writeToFile(entry);
    
    // Console output with colors
    this.consoleOutput(entry);
  }

  private writeToFile(entry: LogEntry) {
    try {
      const fileName = `app-${new Date().toISOString().split('T')[0]}.log`;
      const filePath = path.join(this.logDirectory, fileName);
      const logLine = `${entry.timestamp.toISOString()} [${LogLevel[entry.level]}] ${entry.message}`;
      const contextLine = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : '';
      const stackLine = entry.stack ? `\nStack: ${entry.stack}` : '';
      
      fs.appendFileSync(filePath, `${logLine}${contextLine}${stackLine}\n`);
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  private consoleOutput(entry: LogEntry) {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
    };
    
    const reset = '\x1b[0m';
    const color = colors[entry.level] || '';
    const levelName = LogLevel[entry.level];
    
    console.log(
      `${color}[${entry.timestamp.toISOString()}] ${levelName}: ${entry.message}${reset}`
    );
    
    if (entry.context) {
      console.log(`${color}Context:${reset}`, entry.context);
    }
    
    if (entry.stack) {
      console.log(`${color}Stack:${reset}`, entry.stack);
    }
  }

  debug(message: string, context?: any, metadata?: any) {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      message,
      context,
      metadata
    });
  }

  info(message: string, context?: any, metadata?: any) {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.INFO,
      message,
      context,
      metadata
    });
  }

  warn(message: string, context?: any, metadata?: any) {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.WARN,
      message,
      context,
      metadata
    });
  }

  error(message: string, error?: Error, context?: any, metadata?: any) {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      message,
      context,
      stack: error?.stack,
      metadata
    });

    // Create error report for tracking
    if (error) {
      this.createErrorReport(error, context, 'medium');
    }
  }

  critical(message: string, error?: Error, context?: any, metadata?: any) {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.CRITICAL,
      message,
      context,
      stack: error?.stack,
      metadata
    });

    // Create critical error report
    if (error) {
      this.createErrorReport(error, context, 'critical');
    }
  }

  // Enhanced error reporting
  createErrorReport(error: Error, context: any, severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const reportId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const report: ErrorReport = {
      id: reportId,
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack || ''
      } as Error,
      context,
      severity,
      resolved: false,
      tags: this.generateErrorTags(error, context)
    };

    this.errorReports.push(report);
    
    // Write detailed error report to file
    this.writeErrorReport(report);
    
    return reportId;
  }

  private generateErrorTags(error: Error, context: any): string[] {
    const tags: string[] = [];
    
    // Error type tags
    if (error.name) tags.push(`error:${error.name.toLowerCase()}`);
    
    // HTTP status tags
    if (context?.statusCode) tags.push(`status:${context.statusCode}`);
    
    // Service tags
    if (context?.service) tags.push(`service:${context.service}`);
    
    // User context tags
    if (context?.userId) tags.push('user-error');
    if (context?.admin) tags.push('admin-error');
    
    // Database tags
    if (error.message?.includes('database') || error.message?.includes('sql')) {
      tags.push('database-error');
    }
    
    // API tags
    if (error.message?.includes('api') || error.message?.includes('request')) {
      tags.push('api-error');
    }

    return tags;
  }

  private writeErrorReport(report: ErrorReport) {
    try {
      const fileName = `errors-${new Date().toISOString().split('T')[0]}.json`;
      const filePath = path.join(this.logDirectory, fileName);
      
      let existingReports = [];
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        existingReports = JSON.parse(content);
      }
      
      existingReports.push(report);
      fs.writeFileSync(filePath, JSON.stringify(existingReports, null, 2));
    } catch (writeError) {
      console.error('Failed to write error report:', writeError);
    }
  }

  // Request logging middleware
  requestLogger(req: any, res: any, next: any) {
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    
    const startTime = Date.now();
    
    this.info('Request started', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
      
      this.addLog({
        timestamp: new Date(),
        level,
        message: 'Request completed',
        context: {
          requestId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userId: req.user?.id
        },
        requestId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      });
    });

    next();
  }

  // Get logs with filtering
  getLogs(filters: {
    level?: LogLevel;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    requestId?: string;
    limit?: number;
  } = {}): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters.level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= filters.level!);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.requestId) {
      filteredLogs = filteredLogs.filter(log => log.requestId === filters.requestId);
    }

    const limit = filters.limit || 1000;
    return filteredLogs.slice(-limit);
  }

  // Get error reports
  getErrorReports(filters: {
    severity?: string;
    resolved?: boolean;
    startDate?: Date;
    tags?: string[];
  } = {}): ErrorReport[] {
    let reports = [...this.errorReports];

    if (filters.severity) {
      reports = reports.filter(r => r.severity === filters.severity);
    }

    if (filters.resolved !== undefined) {
      reports = reports.filter(r => r.resolved === filters.resolved);
    }

    if (filters.startDate) {
      reports = reports.filter(r => r.timestamp >= filters.startDate!);
    }

    if (filters.tags && filters.tags.length > 0) {
      reports = reports.filter(r => 
        filters.tags!.some(tag => r.tags.includes(tag))
      );
    }

    return reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mark error as resolved
  resolveError(errorId: string): boolean {
    const report = this.errorReports.find(r => r.id === errorId);
    if (report) {
      report.resolved = true;
      this.info(`Error report resolved: ${errorId}`);
      return true;
    }
    return false;
  }

  // Get system statistics
  getStats() {
    const now = Date.now();
    const hourAgo = now - 3600000;
    const recentLogs = this.logs.filter(log => log.timestamp.getTime() > hourAgo);
    
    return {
      totalLogs: this.logs.length,
      recentLogs: recentLogs.length,
      errorCount: recentLogs.filter(log => log.level >= LogLevel.ERROR).length,
      warningCount: recentLogs.filter(log => log.level === LogLevel.WARN).length,
      criticalCount: recentLogs.filter(log => log.level === LogLevel.CRITICAL).length,
      unresolvedErrors: this.errorReports.filter(r => !r.resolved).length,
      topErrorTags: this.getTopErrorTags(),
      logsByLevel: {
        [LogLevel.DEBUG]: recentLogs.filter(l => l.level === LogLevel.DEBUG).length,
        [LogLevel.INFO]: recentLogs.filter(l => l.level === LogLevel.INFO).length,
        [LogLevel.WARN]: recentLogs.filter(l => l.level === LogLevel.WARN).length,
        [LogLevel.ERROR]: recentLogs.filter(l => l.level === LogLevel.ERROR).length,
        [LogLevel.CRITICAL]: recentLogs.filter(l => l.level === LogLevel.CRITICAL).length,
      }
    };
  }

  private getTopErrorTags(): Array<{ tag: string; count: number }> {
    const tagCounts: { [key: string]: number } = {};
    
    this.errorReports.forEach(report => {
      report.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Export logs for analysis
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'Timestamp,Level,Message,Context,RequestID,UserID,IP';
      const rows = this.logs.map(log => [
        log.timestamp.toISOString(),
        LogLevel[log.level],
        `"${log.message.replace(/"/g, '""')}"`,
        log.context ? `"${JSON.stringify(log.context).replace(/"/g, '""')}"` : '',
        log.requestId || '',
        log.userId || '',
        log.ip || ''
      ].join(','));
      
      return [headers, ...rows].join('\n');
    }

    return JSON.stringify({
      exportTime: new Date().toISOString(),
      stats: this.getStats(),
      logs: this.logs,
      errorReports: this.errorReports
    }, null, 2);
  }
}

export const loggingService = new LoggingService();
export { LogLevel };
