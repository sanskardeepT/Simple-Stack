import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="login-shell">
      <div className="login-card stack">
        <div className="login-logo">
          <div className="login-logo-icon">?</div>
          <div className="login-title">Page not found</div>
          <div className="login-subtitle">This route wandered off. The good news is the rest of the product did not.</div>
        </div>
        <div className="row">
          <Link to="/" className="btn btn-secondary">Go home</Link>
          <Link to="/app" className="btn btn-primary">Open app</Link>
        </div>
      </div>
    </div>
  );
}
