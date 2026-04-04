import { EntryModel } from "../../models/Entry.js";

export async function getTrendingEntries(limit: number): Promise<Array<Record<string, unknown>>> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return EntryModel.aggregate([
    { $match: { status: "published", publishedAt: { $exists: true, $ne: null } } },
    {
      $lookup: {
        from: "analytics",
        let: { entryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$entityId", "$$entryId"] },
              event: "view",
              createdAt: { $gte: sevenDaysAgo },
            },
          },
          {
            $group: {
              _id: null,
              views7d: { $sum: 1 },
              views24h: { $sum: { $cond: [{ $gte: ["$createdAt", dayAgo] }, 1, 0] } },
            },
          },
        ],
        as: "analyticsStats",
      },
    },
    {
      $addFields: {
        analyticsStats: { $ifNull: [{ $arrayElemAt: ["$analyticsStats", 0] }, { views7d: 0, views24h: 0 }] },
        daysSincePublished: { $divide: [{ $subtract: [now, "$publishedAt"] }, 1000 * 60 * 60 * 24] },
      },
    },
    {
      $addFields: {
        trendingScore: {
          $subtract: [
            {
              $add: [
                { $multiply: ["$analyticsStats.views7d", 3] },
                { $multiply: ["$analyticsStats.views24h", 10] },
                { $max: [0, { $subtract: [10, "$daysSincePublished"] }] },
              ],
            },
            { $multiply: ["$daysSincePublished", 0.1] },
          ],
        },
      },
    },
    { $sort: { trendingScore: -1 } },
    { $limit: limit },
  ]).exec();
}
