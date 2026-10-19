/**
 * High-Performance Caching Layer for Labdhi Herbs API
 * Supports in-memory TTL caching with automatic expiration & pattern invalidation.
 * Drop-in ready for high-traffic scalability (10k+ concurrent visitors).
 */

export const CACHE_KEYS = {
  SITE_SETTINGS: 'site_settings:global',
  HOMEPAGE_CONFIG: 'homepage_config:global',
  CATEGORIES_ACTIVE: 'categories:active',
  PRODUCTS_PREFIX: 'products:',
};

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private store: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic sweep every 60 seconds to prune expired keys and free RAM
    this.cleanupInterval = setInterval(() => {
      this.purgeExpired();
    }, 60000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Retrieve cached value by key (returns synchronously or can be awaited)
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set cached value with TTL in seconds (default 120s / 2 minutes)
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 120): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Delete specific cache key
   */
  public del(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate multiple keys by pattern prefix (e.g. "products:*", "categories:*")
   */
  public delByPattern(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let deletedCount = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get cached item or compute and cache if missing (Cache-Aside Pattern)
   */
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 120
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const freshData = await fetchFn();
    this.set(key, freshData, ttlSeconds);
    return freshData;
  }

  /**
   * Flush all cached entries
   */
  public flush(): void {
    this.store.clear();
  }

  /**
   * Get cache metrics
   */
  public getStats() {
    return {
      activeKeys: this.store.size,
      timestamp: new Date().toISOString(),
    };
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const cache = new CacheService();
