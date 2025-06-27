import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, validateInput, limitRequestSize } from "./middleware/securityMiddleware";
import { loggingService } from "./services/loggingService";
import { monitoringService } from "./services/monitoringService";
import { cacheService } from "./services/cacheService";

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(limitRequestSize);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(validateInput);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error with context
    loggingService.error('Request error', err, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: status
    });

    res.status(status).json({ 
      message,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    const startupMessage = `🚀 AutoNews.AI Server Started Successfully`;
    const details = {
      port,
      environment: app.get("env"),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      features: [
        '✅ Advanced Security Middleware',
        '✅ Multi-level Caching System',
        '✅ Real-time Performance Monitoring',
        '✅ Comprehensive Error Tracking',
        '✅ Rate Limiting & DDoS Protection',
        '✅ Request/Response Compression',
        '✅ XSS & SQL Injection Protection',
        '✅ Automated System Health Checks'
      ]
    };

    log(startupMessage);
    console.log('\n🎯 System Features:');
    details.features.forEach(feature => console.log(`   ${feature}`));
    console.log(`\n📊 Access your AutoNews.AI dashboard at: http://localhost:${port}`);
    console.log(`🔧 Admin metrics available at: http://localhost:${port}/api/admin/metrics`);
    console.log(`❤️  System health: http://localhost:${port}/api/health\n`);

    loggingService.info('AutoNews.AI server started successfully', details);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    loggingService.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      loggingService.info('Server closed');
      cacheService.destroy();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    loggingService.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      loggingService.info('Server closed');
      cacheService.destroy();
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection:', reason);
  });

  // Запуск автономных систем самомасштабирования и продвижения
  setTimeout(async () => {
    try {
      console.log('🚀 Инициализация автономных систем AutoNews.AI...');
      
      // Запуск системы автопродвижения
      const { autoPromotionService } = await import('./services/autoPromotionService');
      await autoPromotionService.startAutoPromotion();
      console.log('✅ Система автопродвижения активирована');
      
      // Запуск системы самоэволюции
      const { selfEvolvingService } = await import('./services/selfEvolvingService');
      await selfEvolvingService.startEvolution();
      console.log('✅ Система самоэволюции активирована');
      
      console.log('🧬 Все автономные системы успешно запущены');
    } catch (error) {
      console.error('❌ Ошибка запуска автономных систем:', error);
    }
  }, 5000); // Запуск через 5 секунд после старта сервера
})();
