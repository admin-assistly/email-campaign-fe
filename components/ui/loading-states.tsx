// Reusable loading state components
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Loading spinner component
export function LoadingSpinner({ 
  size = 'default', 
  className 
}: { 
  size?: 'sm' | 'default' | 'lg'; 
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
}

// Loading overlay component
export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...',
  className 
}: { 
  isLoading: boolean; 
  children: React.ReactNode;
  message?: string;
  className?: string;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
export function LoadingSkeleton({ 
  className, 
  lines = 1 
}: { 
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
        />
      ))}
    </div>
  );
}

// Status indicator component
export function StatusIndicator({ 
  status, 
  size = 'default',
  showText = true 
}: { 
  status: 'loading' | 'success' | 'error' | 'idle';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}) {
  const statusConfig = {
    loading: {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'Loading'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      text: 'Success'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      text: 'Error'
    },
    idle: {
      icon: AlertCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      text: 'Idle'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-2 py-1 rounded-full',
      config.bgColor
    )}>
      <Icon className={cn(
        sizeClasses[size],
        config.color,
        status === 'loading' && 'animate-spin'
      )} />
      {showText && (
        <span className={cn(
          'text-xs font-medium',
          config.color
        )}>
          {config.text}
        </span>
      )}
    </div>
  );
}

// Loading button component
export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  disabled,
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  );
}

// Loading card component
export function LoadingCard({ 
  className,
  lines = 3,
  showHeader = true 
}: { 
  className?: string;
  lines?: number;
  showHeader?: boolean;
}) {
  return (
    <div className={cn(
      'p-6 border rounded-lg bg-white dark:bg-gray-800',
      className
    )}>
      {showHeader && (
        <div className="mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      )}
      <LoadingSkeleton lines={lines} />
    </div>
  );
}

// Loading table component
export function LoadingTable({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
