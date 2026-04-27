import { useAuthStore } from "../../lib/store/auth.store.js";
import { useAnalyticsDashboard } from "../analytics/useAnalytics.js";
import { useSubscriptionStatus } from "../subscription/useSubscription.js";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const stats = useAnalyticsDashboard("7d");
  const subscription = useSubscriptionStatus();

  const data = stats.data ?? { totalUsers: 0, totalEntries: 0, totalViews: 0, activeUsers: 0 };

  const cards = [
    { icon: "✦", label: "Total Content", value: data.totalEntries, color: "#63b3ed" },
    { icon: "◎", label: "Total Views", value: data.totalViews, color: "#68d391" },
    { icon: "⊕", label: "Team Members", value: data.totalUsers, color: "#f6ad55" },
    { icon: "⟳", label: "Active Users", value: data.activeUsers, color: "#b794f4" },
  ];

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</div>
          <div className="page-subtitle">Here&apos;s what&apos;s happening with your CMS today.</div>
        </div>
      </div>

      <div className="grid-4">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value" style={{ color: card.color }}>
              {stats.isPending ? "—" : card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {subscription.data?.status !== "active" && (
        <div className="alert alert-error row" style={{ justifyContent: "space-between" }}>
          <span>Your plan is inactive. Subscribe or apply your coupon to unlock SimpleStack.</span>
          <a className="btn btn-primary btn-sm" href="/app/billing">Open billing</a>
        </div>
      )}

      <div className="grid-2">
        <div className="panel stack">
          <div className="section-title">Quick Actions</div>
          <div className="stack-sm">
            {[
              { icon: "✦", label: "Create new content", href: "/app/entries" },
              { icon: "◈", label: "Upload a file", href: "/app/media" },
              { icon: "⟳", label: "Connect your website", href: "/app/connect" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="nav-link"
                style={{ background: "var(--surface)", borderRadius: "var(--radius-sm)" }}
              >
                <span className="nav-link-icon">{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="panel stack">
          <div className="section-title">How it works</div>
          <div className="stack-sm">
            {[
              { step: "1", text: "Create content types — like Blog Post, Product, FAQ" },
              { step: "2", text: "Add content entries with text, images, and more" },
              { step: "3", text: "Connect your website in one click" },
              { step: "4", text: "Your website updates automatically!" },
            ].map((item) => (
              <div key={item.step} className="row" style={{ alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 22, height: 22, borderRadius: "50%", background: "var(--accent-glow)",
                    border: "1px solid var(--border-strong)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <span className="muted" style={{ fontSize: 13 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
