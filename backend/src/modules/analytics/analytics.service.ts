import { analyticsQueue } from "../../jobs/queue.js";
import { getCache, setCache } from "../../lib/cache.js";
import { analyticsRepository } from "./analytics.repository.js";

export const analyticsService = {
  async getDashboard(range: "7d" | "30d" | "90d") {
    const cacheKey = `analytics:dashboard:${range}`;
    const cached = await getCache<Awaited<ReturnType<typeof analyticsRepository.getDashboardStats>>>(cacheKey);
    if (cached) {
      return cached;
    }
    const stats = await analyticsRepository.getDashboardStats(range);
    await setCache(cacheKey, stats, 300);
    return stats;
  },
  getActivityFeed() {
    return analyticsRepository.getActivityFeed(20);
  },
  async getTrending() {
    const cacheKey = "analytics:trending";
    const cached = await getCache<Awaited<ReturnType<typeof analyticsRepository.getTrending>>>(cacheKey);
    if (cached) {
      return cached;
    }
    const trending = await analyticsRepository.getTrending(10);
    await setCache(cacheKey, trending, 600);
    return trending;
  },
  async trackEvent(dto: Record<string, unknown>) {
    await analyticsQueue.add("track-event", dto);
    return { queued: true };
  },
};
