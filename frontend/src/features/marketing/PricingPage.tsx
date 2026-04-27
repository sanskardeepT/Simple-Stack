import { Link } from "react-router-dom";

export function PricingPage() {
  return (
    <div className="marketing-shell marketing-simple-page">
      <div className="section-kicker">Pricing</div>
      <h1 className="hero-title">Rs100/month, or free with the right coupon.</h1>
      <p className="hero-copy-text">Everything you need to run a clean headless CMS setup without plugin bloat or enterprise billing dread.</p>
      <div className="pricing-card" style={{ maxWidth: 420 }}>
        <div className="pricing-amount">Rs100<span>/month</span></div>
        <div className="muted">Coupon `SANSKARDEEP` unlocks the plan for free.</div>
        <Link to="/register" className="btn btn-primary" style={{ width: "100%" }}>Create account</Link>
      </div>
    </div>
  );
}
