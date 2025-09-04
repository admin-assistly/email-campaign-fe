// Centralized error logging system
import { config } from './config';

export interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  error: Error | string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface ApiErrorLogData extends ErrorLogData {
  endpoint: string;
  method: string;
  status?: number;
  responseData?: any;
  requestData?: any;
}

class ErrorLogger {
  private logs: ErrorLogData[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatError(error: Error | string): string {
    if (typeof error === 'string') return error;
    return error.message || 'Unknown error occurred';
  }

  private getStack(error: Error | string): string | undefined {
    if (typeof error === 'string') return undefined;
    return error.stack;
  }

  private getContext(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server-side',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      appVersion: config.app.name,
      environment: process.env.NODE_ENV,
    };
  }

  private addToLogs(logData: ErrorLogData): void {
    this.logs.push(logData);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  public logError(
    error: Error | string,
    context?: Record<string, any>,
    componentStack?: string
  ): void {
    const logData: ErrorLogData = {
      message: this.formatError(error),
      stack: this.getStack(error),
      componentStack,
      error,
      ...this.getContext(),
      context: { ...this.getContext(), ...context },
    };

    this.addToLogs(logData);

    // Console logging in development
    if (this.isDevelopment) {
      console.group('🚨 Error Logged');
      console.error('Message:', logData.message);
      console.error('Stack:', logData.stack);
      console.error('Component Stack:', logData.componentStack);
      console.error('Context:', logData.context);
      console.groupEnd();
    }

    // In production, you could send to external service
    this.sendToExternalService(logData);
  }

  public logApiError(
    error: Error | string,
    endpoint: string,
    method: string,
    status?: number,
    responseData?: any,
    requestData?: any,
    context?: Record<string, any>
  ): void {
    const logData: ApiErrorLogData = {
      message: this.formatError(error),
      stack: this.getStack(error),
      error,
      endpoint,
      method,
      status,
      responseData,
      requestData,
      ...this.getContext(),
      context: { ...this.getContext(), ...context },
    };

    this.addToLogs(logData);

    // Console logging in development
    if (this.isDevelopment) {
      console.group('🌐 API Error Logged');
      console.error('Endpoint:', endpoint);
      console.error('Method:', method);
      console.error('Status:', status);
      console.error('Message:', logData.message);
      console.error('Request Data:', requestData);
      console.error('Response Data:', responseData);
      console.groupEnd();
    }

    // Send to external service
    this.sendToExternalService(logData);
  }

  private async sendToExternalService(logData: ErrorLogData): Promise<void> {
    // In production, implement sending to external error tracking service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to your own error tracking endpoint
        // await fetch('/api/error-log', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(logData),
        // });
        
        // For now, just log to console in production
        console.error('Production Error:', logData);
      } catch (sendError) {
        console.error('Failed to send error to external service:', sendError);
      }
    }
  }

  public getLogs(): ErrorLogData[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getErrorCount(): number {
    return this.logs.length;
  }

  public getRecentErrors(limit: number = 10): ErrorLogData[] {
    return this.logs.slice(-limit);
  }

  public getErrorsByType(errorType: string): ErrorLogData[] {
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(errorType.toLowerCase())
    );
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Convenience functions
export const logError = (error: Error | string, context?: Record<string, any>, componentStack?: string) => {
  errorLogger.logError(error, context, componentStack);
};

export const logApiError = (
  error: Error | string,
  endpoint: string,
  method: string,
  status?: number,
  responseData?: any,
  requestData?: any,
  context?: Record<string, any>
) => {
  errorLogger.logApiError(error, endpoint, method, status, responseData, requestData, context);
};
