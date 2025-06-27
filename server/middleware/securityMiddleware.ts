
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import xss from 'xss';

// Advanced rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Увеличиваем лимит для автономных систем
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: (req: Request) => {
    // Пропускаем rate limiting для localhost и автономных систем
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost';
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 API requests per minute
  message: { error: 'API rate limit exceeded, please slow down.' },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

export const strictApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Very strict for sensitive operations
  message: { error: 'Sensitive operation rate limit exceeded.' },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Enhanced security headers with Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "wss:",
        "https:",
        "ws:"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginOpenerPolicy: false, // Отключаем для Web3 кошельков
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Compression middleware for performance
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// HTTP Parameter Pollution protection
export const hppProtection = hpp({
  whitelist: ['tags', 'categories', 'sort']
});

// Advanced input validation and sanitization
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // XSS protection
  const sanitizeString = (str: string): string => {
    return xss(str, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  };

  // SQL injection prevention patterns
  const sqlInjectionPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)/gi,
    /(;|\s|^)(\s)*(script|javascript|vbscript|onload|onerror|onclick)/gi,
    /('|(\\x27)|(\\x2D\\x2D)|(%27)|(%2D%2D))/gi
  ];

  const detectSQLInjection = (input: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(input));
  };

  // Recursive sanitization
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      if (detectSQLInjection(obj)) {
        throw new Error('Potential SQL injection detected');
      }
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid input detected',
      message: 'Request contains potentially malicious content'
    });
  }
};

// Enhanced API key validation
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;
  const validApiKeys = [
    process.env.INTERNAL_API_KEY,
    process.env.ADMIN_API_KEY,
    process.env.SERVICE_API_KEY
  ].filter(Boolean);

  if (!apiKey || !validApiKeys.includes(apiKey as string)) {
    return res.status(401).json({ 
      error: 'Invalid or missing API key',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Request size limiting with detailed logging
export const limitRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (contentLength > maxSize) {
    console.warn(`Large request blocked: ${contentLength} bytes from ${req.ip}`);
    return res.status(413).json({ 
      error: 'Request payload too large',
      maxSize: '10MB',
      receivedSize: `${Math.round(contentLength / 1024 / 1024 * 100) / 100}MB`
    });
  }

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || '0'
    };
    
    if (res.statusCode >= 400) {
      console.error('HTTP Error:', logEntry);
    } else if (duration > 1000) {
      console.warn('Slow Request:', logEntry);
    }
  });

  next();
};

// CORS configuration
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:5000',
    'https://autonews-ai.repl.co',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const origin = req.get('Origin');
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Replit-User-Id, X-Replit-User-Name, X-Replit-User-Roles');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

// Authentication helper middleware
export const attachUserInfo = (req: Request, res: Response, next: NextFunction) => {
  // Attach Replit user info if available
  const replitUserId = req.get('X-Replit-User-Id');
  const replitUserName = req.get('X-Replit-User-Name');
  const replitUserRoles = req.get('X-Replit-User-Roles');

  if (replitUserId) {
    (req as any).replitUser = {
      id: replitUserId,
      name: replitUserName,
      roles: replitUserRoles
    };
  }

  // Attach Web3 user info if available from session
  const web3User = (req.session as any)?.web3User;
  if (web3User) {
    (req as any).web3User = web3User;
  }

  // В режиме разработки добавляем демо пользователя если нет аутентификации
  if (process.env.NODE_ENV === 'development' && !replitUserId && !web3User) {
    (req as any).demoUser = {
      id: 'demo-user',
      name: 'Demo User',
      roles: 'user'
    };
  }

  next();
};

// Suspicious activity detection
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /eval\(/gi, // Code injection
    /document\.cookie/gi, // Cookie theft
    /alert\(/gi // XSS alerts
  ];

  const checkSuspiciousContent = (content: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(content));
  };

  const requestContent = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    url: req.url
  });

  if (checkSuspiciousContent(requestContent)) {
    console.error(`Suspicious activity detected from ${req.ip}: ${req.url}`);
    return res.status(403).json({
      error: 'Suspicious activity detected',
      message: 'Request blocked for security reasons'
    });
  }

  next();
};
