import { useState } from "react";
import { ErrorBoundary } from "../../components/ErrorBoundary.js";
import { PageSkeleton } from "../../components/PageSkeleton.js";
import { ActivityFeed } from "./charts/ActivityFeed.js";
import { TrendingChart } from "./charts/TrendingChart.js";
import { ViewsChart } from "./charts/ViewsChart.js";
import { useActivityFeed, useAnalyticsDashboard, useTrending } from "./useAnalytics.js";

export function AnalyticsDashboard() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const dashboard = useAnalyticsDashboard(range);
  const trending = useTrending();
  const activity = useActivityFeed();

  if (dashboard.isPending) {
    return <PageSkeleton />;
  }

  const stats = dashboard.data ?? {
    totalUsers: 0,
    totalEntries: 0,
    totalViews: 0,
    activeUsers: 0,
    activeSubscribers: 0,
    paidSubscribers: 0,
    couponSubscribers: 0,
    mrr: 0,
    totalSitesConnected: 0,
    liveSites: 0,
    viewsByDay: [],
    topEntries: [],
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Operational view across usage, content momentum, and live activity.</p>
        </div>
        <select value={range} onChange={(event) => setRange(event.target.value as "7d" | "30d" | "90d")}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid-4">
        {[
          ["Total Users", stats.totalUsers],
          ["MRR", `Rs${stats.mrr}`],
          ["Active Subscribers", stats.activeSubscribers],
          ["Live Sites", stats.liveSites],
        ].map(([label, value]) => (
          <div key={String(label)} className="panel">
            <p className="muted">{label}</p>
            <h2>{dashboard.isPending ? "..." : typeof value === "number" ? Number(value).toLocaleString() : value}</h2>
          </div>
        ))}
      </div>

      <div className="grid-3">
        <div className="panel"><p className="muted">Published entries</p><h3>{stats.totalEntries}</h3></div>
        <div className="panel"><p className="muted">Coupon subscribers</p><h3>{stats.couponSubscribers}</h3></div>
        <div className="panel"><p className="muted">Total sites connected</p><h3>{stats.totalSitesConnected}</h3></div>
      </div>

      <div className="grid-2">
        <ErrorBoundary>
          <div className="panel">
            <h3>Views Over Time</h3>
            <ViewsChart data={stats.viewsByDay} />
          </div>
        </ErrorBoundary>
        <ErrorBoundary>
          <div className="panel">
            <h3>Trending Content</h3>
            <TrendingChart data={trending.data ?? stats.topEntries} />
          </div>
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <div className="panel">
          <h3>Recent Activity</h3>
          <ActivityFeed data={activity.data ?? []} />
        </div>
      </ErrorBoundary>
    </div>
  );
}
