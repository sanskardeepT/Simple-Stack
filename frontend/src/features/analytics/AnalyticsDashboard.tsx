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
          ["Published Entries", stats.totalEntries],
          ["Total Views", stats.totalViews],
          ["Active Users", stats.activeUsers],
        ].map(([label, value]) => (
          <div key={String(label)} className="panel">
            <p className="muted">{label}</p>
            <h2>{dashboard.isPending ? "..." : Number(value).toLocaleString()}</h2>
          </div>
        ))}
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
