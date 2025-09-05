// Centralized API client with error handling and caching
import { config } from './config';
import type { ApiResponse, ApiError } from './types';

interface RequestOptions extends RequestInit {
  timeout?: number;
  cache?: RequestCache;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private cache: Map<string, CacheEntry> = new Map();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.defaultTimeout = config.api.timeout;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const { timeout = this.defaultTimeout, cache = 'default', ...fetchOptions } = options;

    // Check cache for GET requests
    if (fetchOptions.method === 'GET' || !fetchOptions.method) {
      const cached = this.getFromCache(url);
      if (cached) {
        return cached;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseResponse(response);
        throw this.createApiError(response.status, errorData);
      }

      const data = await this.parseResponse(response);
      const result: ApiResponse<T> = {
        success: true,
        message: 'Success',
        data,
      };

      // Cache successful GET responses
      if (fetchOptions.method === 'GET' || !fetchOptions.method) {
        this.setCache(url, result);
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createApiError(408, { message: 'Request timeout' });
        }
        throw error;
      }
      
      throw this.createApiError(500, { message: 'Unknown error occurred' });
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    if (contentType && contentType.includes('text/html')) {
      throw this.createApiError(response.status, { 
        message: 'Authentication required. Please log in again.',
        details: 'Backend returned HTML error page'
      });
    }
    
    return response.text();
  }

  private createApiError(status: number, data: any): ApiError {
    return {
      message: data.message || `HTTP error! status: ${status}`,
      status,
      details: data,
    };
  }

  private getCacheKey(url: string): string {
    return url;
  }

  private getFromCache(url: string): any {
    const key = this.getCacheKey(url);
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }
    
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(url: string, data: any, ttl: number = this.defaultCacheTTL): void {
    const key = this.getCacheKey(url);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Generic request methods
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for external use
export type { RequestOptions, CacheEntry };
