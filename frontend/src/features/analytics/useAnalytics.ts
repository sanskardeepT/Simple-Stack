import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getActivityFeedApi,
  getAnalyticsDashboardApi,
  getTrendingApi,
  trackEventApi,
} from "../../lib/api/analytics.api.js";

export function useAnalyticsDashboard(range: "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: ["analytics", "dashboard", range],
    queryFn: async () => {
      const response = await getAnalyticsDashboardApi(range);
      return response.data.data as {
        totalUsers: number;
        totalEntries: number;
        totalViews: number;
        activeUsers: number;
        activeSubscribers: number;
        paidSubscribers: number;
        couponSubscribers: number;
        mrr: number;
        totalSitesConnected: number;
        liveSites: number;
        viewsByDay: Array<{ _id: string; count: number }>;
        topEntries: Array<{ title: string; viewCount: number }>;
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ["analytics", "trending"],
    queryFn: async () => {
      const response = await getTrendingApi();
      return response.data.data as Array<{ title: string; viewCount?: number; trendingScore?: number }>;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ["analytics", "activity"],
    queryFn: async () => {
      const response = await getActivityFeedApi();
      return response.data.data as Array<Record<string, unknown>>;
    },
    refetchInterval: 30_000,
  });
}

export function useTrackEvent() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await trackEventApi(payload);
      return response.data.data;
    },
  });
}
