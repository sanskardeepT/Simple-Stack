import { api } from "./client.js";

export function getAnalyticsDashboardApi(range: "7d" | "30d" | "90d") {
  return api.get("/analytics/dashboard", { params: { range } });
}

export function getTrendingApi() {
  return api.get("/analytics/trending");
}

export function getActivityFeedApi() {
  return api.get("/analytics/activity");
}

export function trackEventApi(payload: Record<string, unknown>) {
  return api.post("/analytics/event", payload);
}
