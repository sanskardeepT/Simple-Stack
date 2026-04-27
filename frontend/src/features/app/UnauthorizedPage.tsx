export function UnauthorizedPage() {
  return (
    <div className="login-shell">
      <div className="login-card stack">
        <div className="login-logo">
          <div className="login-logo-icon">!</div>
          <div className="login-title">Private area</div>
          <div className="login-subtitle">Your account does not have access to this section yet.</div>
        </div>
        <a href="/app" className="btn btn-primary">Back to dashboard</a>
      </div>
    </div>
  );
}
