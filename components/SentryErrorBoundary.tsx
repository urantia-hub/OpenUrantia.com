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

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      // Redirect after a short delay to allow Sentry to capture the error
      setTimeout(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_HOST}?genericError=true`;
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl mb-4">Something went wrong</h1>
            <p>Redirecting you back home...</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SentryErrorBoundary;
