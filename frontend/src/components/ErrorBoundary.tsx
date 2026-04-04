import type { PropsWithChildren } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Button } from "./ui/Button.js";

export function ErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="panel stack">
          <h2>Something went wrong</h2>
          <p className="muted">{error.message}</p>
          <Button onClick={resetErrorBoundary}>Try again</Button>
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
