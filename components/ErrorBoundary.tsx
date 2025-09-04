import { Component, ReactNode } from "react";
import { logError } from "@/lib/error-logging";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error with component stack information
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorInfo,
    }, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[40vh] text-center"
          style={{ color: "hsl(var(--error-text))" }}
        >
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground border"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
