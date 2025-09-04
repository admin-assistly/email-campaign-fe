// Performance monitoring utility
export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  timeToInteractive: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface PerformanceEvent {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private events: PerformanceEvent[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Measure page load time
      this.measurePageLoadTime();
      
      // Set up performance observers
      this.setupObservers();
      
      // Measure Core Web Vitals
      this.measureCoreWebVitals();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  private measurePageLoadTime(): void {
    if (document.readyState === 'complete') {
      this.measureLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        this.measureLoadMetrics();
      });
    }
  }

  private measureLoadMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      timeToFirstByte: navigation.responseStart - navigation.requestStart,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    };

    this.metrics = metrics;
    this.trackEvent('page_load_complete', metrics.pageLoadTime);
  }

  private setupObservers(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[entries.length - 1];
          if (fcp && this.metrics) {
            this.metrics.firstContentfulPaint = fcp.startTime;
            this.trackEvent('first_contentful_paint', fcp.startTime);
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        console.warn('FCP observer setup failed:', error);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          if (lcp && this.metrics) {
            this.metrics.largestContentfulPaint = lcp.startTime;
            this.trackEvent('largest_contentful_paint', lcp.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer setup failed:', error);
      }

              // Cumulative Layout Shift
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
              if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
                clsValue += layoutShiftEntry.value;
              }
            }
            if (this.metrics) {
              this.metrics.cumulativeLayoutShift = clsValue;
              this.trackEvent('cumulative_layout_shift', clsValue);
            }
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.set('cls', clsObserver);
        } catch (error) {
          console.warn('CLS observer setup failed:', error);
        }

              // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fid = entries[entries.length - 1] as PerformanceEntry & { processingStart?: number; startTime?: number };
            if (fid && this.metrics && fid.processingStart && fid.startTime) {
              this.metrics.firstInputDelay = fid.processingStart - fid.startTime;
              this.trackEvent('first_input_delay', this.metrics.firstInputDelay);
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
          this.observers.set('fid', fidObserver);
        } catch (error) {
          console.warn('FID observer setup failed:', error);
        }
    }
  }

  private measureCoreWebVitals(): void {
    // Measure Time to Interactive
    if (document.readyState === 'interactive') {
      this.measureTimeToInteractive();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.measureTimeToInteractive();
      });
    }
  }

  private measureTimeToInteractive(): void {
    const now = performance.now();
    if (this.metrics) {
      this.metrics.timeToInteractive = now;
      this.trackEvent('time_to_interactive', now);
    }
  }

  public trackEvent(name: string, value: number, metadata?: Record<string, any>): void {
    const event: PerformanceEvent = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.events.push(event);

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Event:', event);
    }

    // Send to analytics service in production
    this.sendToAnalytics(event);
  }

  private async sendToAnalytics(event: PerformanceEvent): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to your analytics endpoint
        // await fetch('/api/analytics/performance', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event)
        // });
        
        // For now, just log to console in production
        console.log('Performance event logged:', event);
      } catch (error) {
        console.warn('Failed to send performance event to analytics:', error);
      }
    }
  }

  public getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  public getEvents(): PerformanceEvent[] {
    return [...this.events];
  }

  public getRecentEvents(limit: number = 10): PerformanceEvent[] {
    return this.events.slice(-limit);
  }

  public getEventsByName(name: string): PerformanceEvent[] {
    return this.events.filter(event => event.name === name);
  }

  public getAverageMetric(metricName: string): number {
    const events = this.getEventsByName(metricName);
    if (events.length === 0) return 0;
    
    const sum = events.reduce((acc, event) => acc + event.value, 0);
    return sum / events.length;
  }

  public getPerformanceScore(): number {
    if (!this.metrics) return 0;

    let score = 100;

    // Deduct points for poor performance
    if (this.metrics.largestContentfulPaint > 2500) score -= 25;
    if (this.metrics.firstInputDelay > 100) score -= 25;
    if (this.metrics.cumulativeLayoutShift > 0.1) score -= 25;
    if (this.metrics.pageLoadTime > 3000) score -= 25;

    return Math.max(0, score);
  }

  public getPerformanceReport(): {
    score: number;
    metrics: PerformanceMetrics | null;
    recommendations: string[];
  } {
    const score = this.getPerformanceScore();
    const recommendations: string[] = [];

    if (this.metrics) {
      if (this.metrics.largestContentfulPaint > 2500) {
        recommendations.push('Optimize images and reduce bundle size to improve LCP');
      }
      if (this.metrics.firstInputDelay > 100) {
        recommendations.push('Reduce JavaScript execution time to improve FID');
      }
      if (this.metrics.cumulativeLayoutShift > 0.1) {
        recommendations.push('Fix layout shifts by setting explicit dimensions for images and ads');
      }
      if (this.metrics.pageLoadTime > 3000) {
        recommendations.push('Optimize server response time and reduce initial bundle size');
      }
    }

    return {
      score,
      metrics: this.metrics,
      recommendations
    };
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const trackPerformanceEvent = (name: string, value: number, metadata?: Record<string, any>) => {
  performanceMonitor.trackEvent(name, value, metadata);
};

export const getPerformanceMetrics = () => {
  return performanceMonitor.getMetrics();
};

export const getPerformanceScore = () => {
  return performanceMonitor.getPerformanceScore();
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};
