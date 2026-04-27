import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const comparisons = [
  ["SimpleStack", "Fast setup", "Built for Indian small teams", "Clean API-first flow", "Rs100/mo"],
  ["WordPress", "Plugin-heavy", "Needs theme upkeep", "Not headless by default", "Varies"],
  ["Contentstack", "Enterprise-first", "Powerful but expensive", "Excellent", "High"],
  ["Strapi", "Developer-friendly", "Self-hosting burden", "Good", "Infra + time"],
];

const blogPosts = [
  { title: "Why small teams need a calm CMS", excerpt: "Fewer plugins, fewer late-night surprises, faster shipping." },
  { title: "How to connect content to any site in one line", excerpt: "A tiny embed script can go a long way when the API is shaped well." },
  { title: "Launching a SaaS for Indian developers", excerpt: "Pricing, support, and UX choices that feel local from day one." },
];

export function MarketingHomePage() {
  const [coupon, setCoupon] = useState("");
  const unlocked = coupon.trim().toUpperCase() === "SANSKARDEEP";
  const confetti = useMemo(
    () => Array.from({ length: 18 }, (_, index) => ({
      left: `${(index * 7) % 100}%`,
      delay: `${(index % 6) * 0.12}s`,
      rotate: `${index * 17}deg`,
    })),
    [],
  );

  return (
    <div className="marketing-shell">
      <header className="marketing-nav">
        <Link to="/" className="marketing-brand">
          <span className="marketing-brand-icon">S</span>
          <span>SimpleStack</span>
        </Link>
        <nav className="marketing-links">
          <a href="#pricing">Pricing</a>
          <a href="#demo">Live demo</a>
          <a href="#compare">Compare</a>
          <a href="#blog">Blog</a>
        </nav>
        <div className="marketing-actions">
          <Link to="/login" className="btn btn-secondary">Sign in</Link>
          <Link to="/register" className="btn btn-primary">Start free</Link>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy stack-lg">
          <span className="marketing-pill">Headless CMS for Indian developers and small businesses</span>
          <h1 className="hero-title">Manage your website content without touching code</h1>
          <p className="hero-copy-text">
            SimpleStack gives you a premium editing space, a tiny connect script, and pricing that does not feel like enterprise punishment.
          </p>
          <div className="row">
            <Link to="/register" className="btn btn-primary">Create your workspace</Link>
            <Link to="/app/connect" className="btn btn-secondary">See the product</Link>
          </div>
          <div className="hero-proof row">
            <span>Setup in minutes</span>
            <span>Rs100/month</span>
            <span>Works with any frontend</span>
          </div>
        </div>

        <div className="hero-demo-card">
          <div className="hero-demo-toolbar">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
            <span className="hero-demo-label">Live content flow</span>
          </div>
          <div className="hero-demo-panels">
            <div className="hero-demo-panel">
              <div className="hero-demo-heading">Edit here</div>
              <div className="hero-demo-item">
                <strong>Menu item</strong>
                <span>Paneer Tikka Wrap</span>
                <small>Published</small>
              </div>
              <div className="hero-demo-item">
                <strong>Blog post</strong>
                <span>Summer launch checklist</span>
                <small>Draft</small>
              </div>
            </div>
            <div className="hero-demo-arrow">→</div>
            <div className="hero-demo-panel hero-demo-site">
              <div className="hero-demo-heading">Update everywhere</div>
              <div className="hero-site-card">
                <span className="hero-site-tag">Website</span>
                <strong>Fresh homepage specials</strong>
                <p>Content synced from SimpleStack. No redeploy drama.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="pricing">
        <div className="section-kicker">Pricing</div>
        <div className="pricing-band">
          <div className="pricing-copy">
            <h2>One plan. No weird feature gates.</h2>
            <p>All core CMS features, media uploads, public API access, and your website connect flow for Rs100 per month.</p>
          </div>
          <div className={`pricing-card ${unlocked ? "pricing-card-unlocked" : ""}`}>
            {unlocked && (
              <div className="confetti-layer" aria-hidden="true">
                {confetti.map((piece, index) => (
                  <span key={index} className="confetti-piece" style={{ left: piece.left, animationDelay: piece.delay, rotate: piece.rotate }} />
                ))}
              </div>
            )}
            <div className="pricing-amount">Rs100<span>/month</span></div>
            <div className="muted">Perfect for launch-stage websites, agencies, and indie products.</div>
            <input
              className="field-input"
              placeholder="Try coupon SANSKARDEEP"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
            />
            <div className={`coupon-banner ${unlocked ? "show" : ""}`}>This plan is now FREE for you!</div>
            <Link to="/register" className="btn btn-primary" style={{ width: "100%" }}>Start now</Link>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="demo">
        <div className="section-kicker">How it works</div>
        <div className="grid-3">
          {[
            ["1", "Sign up", "Create your account and open your first workspace."],
            ["2", "Connect", "Paste one script tag or use the public API in your frontend."],
            ["3", "Edit", "Change content in SimpleStack and your website refreshes fast."],
          ].map(([step, title, text]) => (
            <div key={step} className="marketing-step-card">
              <span className="marketing-step-number">{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="compare">
        <div className="section-kicker">Comparison</div>
        <div className="panel-glass stack">
          <h2 className="comparison-title">Built to feel lighter than WordPress and cheaper than enterprise CMS tools.</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Setup</th>
                  <th>For small teams</th>
                  <th>API flow</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => <td key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="blog">
        <div className="section-kicker">Blog</div>
        <div className="grid-3">
          {blogPosts.map((post) => (
            <article key={post.title} className="blog-card">
              <span className="blog-chip">Launch notes</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <a href="#top">Read preview</a>
            </article>
          ))}
        </div>
      </section>

      <footer className="marketing-footer">
        <div>
          <div className="marketing-brand">
            <span className="marketing-brand-icon">S</span>
            <span>SimpleStack</span>
          </div>
          <p className="muted">Premium headless CMS for teams that want clarity, speed, and fair pricing.</p>
        </div>
        <div className="marketing-footer-links">
          <Link to="/register">Get started</Link>
          <Link to="/login">Sign in</Link>
          <a href="#pricing">Pricing</a>
        </div>
      </footer>
    </div>
  );
}
