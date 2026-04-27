import type { PropsWithChildren } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Button } from "./ui/Button.js";

export function ErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="panel stack error-panel">
          <div className="error-panel-badge">System pause</div>
          <h2>Something went wrong</h2>
          <p className="muted">{error.message}</p>
          <div className="row">
            <Button onClick={resetErrorBoundary}>Try again</Button>
            <a href="/" className="btn btn-secondary">Go home</a>
          </div>
        </div>
      )}
      onError={(error) => {
        console.error(error);
      }}
      onReset={() => undefined}
    >
      {children}
    </ReactErrorBoundary>
  );
}
