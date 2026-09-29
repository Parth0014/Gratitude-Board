import * as Sentry from "@sentry/browser";
import React from "react";

interface TopErrorBoundaryState {
  hasError: boolean;
}

export class TopErrorBoundary extends React.Component<
  React.PropsWithChildren,
  TopErrorBoundaryState
> {
  state: TopErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): TopErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtra("componentStack", errorInfo.componentStack);
      Sentry.captureException(error);
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <main className="gratitude-error" role="alert">
        <div className="gratitude-error__mark" aria-hidden="true">
          {"\u2665"}
        </div>
        <h1>Something went wrong</h1>
        <p>Your board is still saved locally. Reload the studio to continue.</p>
        <button
          type="button"
          onClick={(event) =>
            event.currentTarget.ownerDocument.defaultView?.location.reload()
          }
        >
          Reload studio
        </button>
      </main>
    );
  }
}
