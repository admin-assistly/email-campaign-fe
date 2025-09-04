// Service Worker registration and management utilities
export interface ServiceWorkerConfig {
  scope: string;
  updateViaCache: RequestCache;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  async register(config: ServiceWorkerConfig = { scope: '/', updateViaCache: 'all' }): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported in this browser');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: config.scope,
        updateViaCache: config.updateViaCache
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (config.onUpdate) {
                config.onUpdate(this.registration!);
              }
            }
          });
        }
      });

      // Handle successful registration
      if (config.onSuccess) {
        config.onSuccess(this.registration);
      }

      // Set up message handling
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data);
        break;
      case 'OFFLINE_ACTION_QUEUED':
        console.log('Offline action queued:', data);
        break;
      case 'SYNC_COMPLETED':
        console.log('Background sync completed:', data);
        break;
      default:
        console.log('Unknown message from service worker:', event.data);
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) {
      console.warn('No service worker registered');
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) {
      return this.registration;
    }

    try {
      this.registration = await navigator.serviceWorker.getRegistration();
      return this.registration;
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      return null;
    }
  }

  async getController(): Promise<ServiceWorker | null> {
    if (navigator.serviceWorker.controller) {
      return navigator.serviceWorker.controller;
    }

    const registration = await this.getRegistration();
    if (registration && registration.active) {
      return registration.active;
    }

    return null;
  }

  async sendMessage(message: any): Promise<void> {
    const controller = await this.getController();
    if (controller) {
      controller.postMessage(message);
    } else {
      console.warn('No service worker controller available');
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted') {
      const registration = await this.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
      } else {
        // Fallback to regular notification
        new Notification(title, options);
      }
    } else {
      console.warn('Notification permission denied');
    }
  }

  async requestBackgroundSync(tag: string): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync not supported');
      return false;
    }

    try {
      const registration = await this.getRegistration();
      if (registration) {
        await registration.sync.register(tag);
        console.log('Background sync registered:', tag);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  addOnlineListener(callback: () => void): void {
    window.addEventListener('online', callback);
  }

  addOfflineListener(callback: () => void): void {
    window.addEventListener('offline', callback);
  }

  removeOnlineListener(callback: () => void): void {
    window.removeEventListener('online', callback);
  }

  removeOfflineListener(callback: () => void): void {
    window.removeEventListener('offline', callback);
  }

  getCacheStats(): Promise<CacheStorage> {
    return caches.keys();
  }

  async clearAllCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Convenience functions
export const registerServiceWorker = (config?: ServiceWorkerConfig) => {
  return serviceWorkerManager.register(config);
};

export const unregisterServiceWorker = () => {
  return serviceWorkerManager.unregister();
};

export const updateServiceWorker = () => {
  return serviceWorkerManager.update();
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  return serviceWorkerManager.showNotification(title, options);
};

export const requestBackgroundSync = (tag: string) => {
  return serviceWorkerManager.requestBackgroundSync(tag);
};
