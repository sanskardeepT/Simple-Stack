import { EntryModel } from "../../models/Entry.js";
import { AnalyticsModel } from "../../models/Analytics.js";
import { getTrendingEntries } from "./trending.js";

function getRangeStart(range: "7d" | "30d" | "90d"): Date {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export const analyticsRepository = {
  logEvent(event: Record<string, unknown>) {
    return AnalyticsModel.create(event);
  },
  async getDashboardStats(range: "7d" | "30d" | "90d") {
    const rangeStart = getRangeStart(range);
    const [summary] = await EntryModel.aggregate([
      {
        $facet: {
          totalUsers: [
            {
              $lookup: {
                from: "users",
                pipeline: [{ $match: { isActive: true } }, { $count: "count" }],
                as: "users",
              },
            },
            { $project: { count: { $ifNull: [{ $arrayElemAt: ["$users.count", 0] }, 0] } } },
          ],
          totalEntries: [{ $match: { status: "published" } }, { $count: "count" }],
          totalViews: [{ $group: { _id: null, count: { $sum: "$viewCount" } } }],
          newEntries: [{ $match: { createdAt: { $gte: rangeStart } } }, { $count: "count" }],
          topEntries: [{ $sort: { viewCount: -1 } }, { $limit: 10 }, { $project: { title: 1, slug: 1, viewCount: 1 } }],
          analytics: [
            {
              $lookup: {
                from: "analytics",
                pipeline: [
                  { $match: { createdAt: { $gte: rangeStart } } },
                  {
                    $facet: {
                      viewsByDay: [
                        { $match: { event: "view" } },
                        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                      ],
                      eventsByType: [{ $group: { _id: "$event", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
                      activeUsers: [{ $match: { userId: { $exists: true, $ne: null } } }, { $group: { _id: "$userId" } }, { $count: "count" }],
                    },
                  },
                ],
                as: "analyticsResult",
              },
            },
            { $project: { analyticsResult: { $arrayElemAt: ["$analyticsResult", 0] } } },
          ],
          newUsers: [
            {
              $lookup: {
                from: "users",
                pipeline: [{ $match: { createdAt: { $gte: rangeStart } } }, { $count: "count" }],
                as: "users",
              },
            },
            { $project: { count: { $ifNull: [{ $arrayElemAt: ["$users.count", 0] }, 0] } } },
          ],
        },
      },
    ]).exec();

    const analytics = summary.analytics?.[0]?.analyticsResult ?? {};
    return {
      totalUsers: summary.totalUsers?.[0]?.count ?? 0,
      totalEntries: summary.totalEntries?.[0]?.count ?? 0,
      totalViews: summary.totalViews?.[0]?.count ?? 0,
      newUsers: summary.newUsers?.[0]?.count ?? 0,
      newEntries: summary.newEntries?.[0]?.count ?? 0,
      viewsByDay: analytics.viewsByDay ?? [],
      eventsByType: analytics.eventsByType ?? [],
      topEntries: summary.topEntries ?? [],
      activeUsers: analytics.activeUsers?.[0]?.count ?? 0,
    };
  },
  getActivityFeed(limit = 20) {
    return AnalyticsModel.find({}).sort({ createdAt: -1 }).limit(limit).populate("userId", "name email").populate("entityId").lean().exec();
  },
  getTrending(limit = 10) {
    return getTrendingEntries(limit);
  },
};
