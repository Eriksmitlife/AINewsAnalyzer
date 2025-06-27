import { Request, Response, NextFunction } from 'express';

class LoggingService {
  private stats = {
    requests: 0,
    errors: 0,
    totalDuration: 0
  };
  private errorReports: any[] = [];

  requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    this.stats.requests++;
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.stats.totalDuration += duration;
      console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
  }

  getStats() {
    return {
      ...this.stats,
      averageDuration: this.stats.requests > 0 ? this.stats.totalDuration / this.stats.requests : 0
    };
  }

  getErrorReports() {
    return this.errorReports;
  }

  error(message: string, context?: any) {
    this.stats.errors++;
    const errorReport = { message, context, timestamp: new Date() };
    this.errorReports.push(errorReport);
    console.error('Error:', message, context);
  }

  info(message: string, context?: any) {
    console.log('Info:', message, context);
  }

  logError(error: Error, context?: any) {
    this.error(error.message, context);
  }

  logInfo(message: string, context?: any) {
    this.info(message, context);
  }
}

export const loggingService = new LoggingService();