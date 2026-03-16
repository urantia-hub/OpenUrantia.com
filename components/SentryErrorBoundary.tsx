import * as Sentry from "@sentry/nextjs";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class SentryErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "development") {
      Sentry.withScope((scope) => {
        scope.setExtras({ componentStack: errorInfo.componentStack });
        Sentry.captureException(error);
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleGoHome = () => {
    window.location.href = process.env.NEXT_PUBLIC_HOST || "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-6">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred. You can try again or return to the home page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded text-sm font-medium bg-neutral-700 hover:bg-neutral-600 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SentryErrorBoundary;
