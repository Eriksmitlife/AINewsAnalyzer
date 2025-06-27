
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalItems: number;
  memoryUsage: number;
  oldestItem: number;
  newestItem: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private hits = 0;
  private misses = 0;
  private maxSize = 10000;
  private defaultTTL = 300000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  // Set cache item with TTL
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now
    });
  }

  // Get cache item
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    const now = Date.now();

    if (!item) {
      this.misses++;
      return null;
    }

    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.hits++;

    return item.data as T;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const items = Array.from(this.cache.values());
    
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
      totalItems: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      oldestItem: Math.min(...items.map(item => item.timestamp)),
      newestItem: Math.max(...items.map(item => item.timestamp))
    };
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, value] of this.cache) {
      size += key.length * 2; // Unicode characters are 2 bytes
      size += JSON.stringify(value).length * 2;
    }
    return size;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.cache.delete(key));
    
    if (expired.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${expired.length} expired items`);
    }
  }

  // Evict least recently used items
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Cache decorator for functions
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `memoized:${fn.name}:${JSON.stringify(args)}`;
      
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      this.set(key, result, ttl);
      return result;
    }) as T;
  }

  // Batch operations
  setMany<T>(items: { key: string; data: T; ttl?: number }[]): void {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany<T>(keys: string[]): { [key: string]: T | null } {
    const result: { [key: string]: T | null } = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  // Cache warming strategies
  warmup(entries: { key: string; data: any; ttl?: number }[]): void {
    console.log(`🔥 Cache warmup: preloading ${entries.length} items`);
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl || this.defaultTTL);
    });
  }

  // Get most accessed items
  getHotItems(limit = 10): Array<{ key: string; accessCount: number }> {
    const items: Array<{ key: string; accessCount: number }> = [];
    
    for (const [key, item] of this.cache) {
      items.push({ key, accessCount: item.accessCount });
    }

    return items
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  // Export cache for backup
  export(): string {
    const data = {
      timestamp: Date.now(),
      stats: this.getStats(),
      items: Array.from(this.cache.entries())
    };
    return JSON.stringify(data, null, 2);
  }

  // Import cache from backup
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.cache.clear();
      
      for (const [key, item] of parsed.items) {
        this.cache.set(key, item);
      }
      
      console.log(`📥 Cache import: loaded ${parsed.items.length} items`);
    } catch (error) {
      console.error('Cache import failed:', error);
    }
  }

  // Destroy cache service
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache instance
export const cacheService = new CacheService();

// Cache middleware for Express routes
export const cacheMiddleware = (ttl = 300000) => {
  return (req: any, res: any, next: any) => {
    const key = `route:${req.method}:${req.originalUrl}`;
    const cached = cacheService.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      cacheService.set(key, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
};
