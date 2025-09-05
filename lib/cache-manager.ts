// Enhanced cache manager with persistence and smart invalidation
import { setLocalStorage, getLocalStorage, removeLocalStorage } from './utils';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  tags: string[];
}

export interface CacheConfig {
  defaultTTL: number;
  maxEntries: number;
  version: string;
  enablePersistence: boolean;
  storageKey: string;
}

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private isInitialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxEntries: 1000,
      version: '1.0.0',
      enablePersistence: true,
      storageKey: 'app-cache',
      ...config
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.config.enablePersistence) {
      await this.loadFromStorage();
    }

    // Clean up expired entries
    this.cleanup();
    
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
    
    this.isInitialized = true;
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = getLocalStorage<Record<string, CacheEntry>>(
        this.config.storageKey, 
        {}
      );
      
      // Only load entries that match current version
      Object.entries(stored).forEach(([key, entry]) => {
        if (entry.version === this.config.version && !this.isExpired(entry)) {
          this.cache.set(key, entry);
        }
      });
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.config.enablePersistence) return;

    try {
      const cacheObject: Record<string, CacheEntry> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      setLocalStorage(this.config.storageKey, cacheObject);
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));

    // If still over max entries, remove oldest
    if (this.cache.size > this.config.maxEntries) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.config.maxEntries);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    // Save to storage after cleanup
    this.saveToStorage();
  }

  public set<T>(
    key: string, 
    data: T, 
    options: { 
      ttl?: number; 
      tags?: string[];
    } = {}
  ): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      version: this.config.version,
      tags: options.tags || []
    };

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  public invalidateByTag(tag: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveToStorage();
  }

  public invalidateByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveToStorage();
  }

  public invalidateByVersion(version: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.version !== version) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveToStorage();
  }

  public getStats(): {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
    memoryUsage: number;
  } {
    let expiredCount = 0;
    let validCount = 0;

    this.cache.forEach(entry => {
      if (this.isExpired(entry)) {
        expiredCount++;
      } else {
        validCount++;
      }
    });

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      validEntries: validCount,
      memoryUsage: JSON.stringify(this.cache).length
    };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getTags(): string[] {
    const tags = new Set<string>();
    this.cache.forEach(entry => {
      entry.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }

  public preload<T>(key: string, fetcher: () => Promise<T>, options?: { ttl?: number; tags?: string[] }): Promise<T> {
    return new Promise((resolve, reject) => {
      fetcher()
        .then(data => {
          this.set(key, data, options);
          resolve(data);
        })
        .catch(reject);
    });
  }

  public async refresh<T>(key: string, fetcher: () => Promise<T>, options?: { ttl?: number; tags?: string[] }): Promise<T> {
    try {
      const data = await fetcher();
      this.set(key, data, options);
      return data;
    } catch (error) {
      // If refresh fails, return cached data if available
      const cached = this.get<T>(key);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Convenience functions
export const setCache = <T>(key: string, data: T, options?: { ttl?: number; tags?: string[] }) => {
  cacheManager.set(key, data, options);
};

export const getCache = <T>(key: string): T | null => {
  return cacheManager.get<T>(key);
};

export const hasCache = (key: string): boolean => {
  return cacheManager.has(key);
};

export const invalidateCache = (pattern: string) => {
  cacheManager.invalidateByPattern(pattern);
};

export const invalidateCacheByTag = (tag: string) => {
  cacheManager.invalidateByTag(tag);
};
