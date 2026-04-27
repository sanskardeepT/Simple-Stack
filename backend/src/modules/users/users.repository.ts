import { Types } from "mongoose";
import { ContentTypeModel } from "../../models/ContentType.js";
import { EntryModel } from "../../models/Entry.js";
import { MediaModel } from "../../models/Media.js";
import { UserModel } from "../../models/User.js";
import { paginate } from "../../utils/query.util.js";

export type AdminUserLean = {
  _id: unknown;
  name: string;
  email: string;
  phone: string;
  role: "superadmin" | "user";
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  subscription?: {
    status: "inactive" | "active" | "expired" | "cancelled";
    plan: "none" | "paid" | "coupon" | "free_trial";
    expiry?: Date | null;
    coupon?: string;
  } | null;
  lastLogin?: Date;
  createdAt?: Date;
};

function buildUserFilter(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};

  if (typeof query.search === "string" && query.search.trim()) {
    filter.$or = [
      { name: { $regex: query.search.trim(), $options: "i" } },
      { email: { $regex: query.search.trim(), $options: "i" } },
      { phone: { $regex: query.search.trim(), $options: "i" } },
    ];
  }

  if (typeof query.status === "string" && query.status) {
    filter["subscription.status"] = query.status;
  }

  if (typeof query.plan === "string" && query.plan) {
    filter["subscription.plan"] = query.plan;
  }

  return filter;
}

export const usersRepository = {
  buildFilter: buildUserFilter,
  findAll(query: Record<string, unknown>) {
    const filter = buildUserFilter(query);
    return paginate(UserModel.find(filter).select("-passwordHash").lean(), {
      page: query.page as string | number | undefined,
      limit: query.limit as string | number | undefined,
      sort: query.sort as string | undefined,
      order: query.order as "asc" | "desc" | undefined,
      allowedSort: ["createdAt", "name", "email", "lastLogin"],
    });
  },
  findRaw(filter: Record<string, unknown>) {
    return UserModel.find(filter).select("-passwordHash").sort({ createdAt: -1 }).lean().exec();
  },
  findById(id: string) {
    return UserModel.findById(id).select("-passwordHash").lean<AdminUserLean>().exec();
  },
  update(id: string, data: Record<string, unknown>) {
    return UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-passwordHash").lean<AdminUserLean>().exec();
  },
  delete(id: string) {
    return UserModel.findByIdAndDelete(id).select("-passwordHash").lean<AdminUserLean>().exec();
  },
  activateSubscription(id: string, input: { months?: number; plan?: "paid" | "coupon" | "free_trial"; coupon?: string }) {
    const expiry = input.plan === "coupon" ? null : new Date();
    if (expiry) {
      expiry.setMonth(expiry.getMonth() + (input.months ?? 1));
    }

    return UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          "subscription.status": "active",
          "subscription.plan": input.plan ?? "paid",
          "subscription.expiry": expiry,
          "subscription.coupon": input.coupon ?? "",
        },
      },
      { new: true },
    ).select("-passwordHash").lean<AdminUserLean>().exec();
  },
  deactivateSubscription(id: string) {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: { "subscription.status": "cancelled" } },
      { new: true },
    ).select("-passwordHash").lean<AdminUserLean>().exec();
  },
  async getCounts(userId: string) {
    const objectId = new Types.ObjectId(userId);
    const [contentTypes, entries, media] = await Promise.all([
      ContentTypeModel.countDocuments({ createdBy: objectId }),
      EntryModel.countDocuments({ createdBy: objectId }),
      MediaModel.countDocuments({ uploadedBy: objectId }),
    ]);

    return {
      contentTypes,
      entries,
      media,
      totalSites: 0,
    };
  },
  async dashboard() {
    const now = new Date();
    const [totalUsers, activeSubscribers, couponUsers, paidUsers] = await Promise.all([
      UserModel.countDocuments({ role: "user" }),
      UserModel.countDocuments({ "subscription.status": "active" }),
      UserModel.countDocuments({ "subscription.status": "active", "subscription.plan": "coupon" }),
      UserModel.countDocuments({
        "subscription.status": "active",
        "subscription.plan": "paid",
        $or: [{ "subscription.expiry": null }, { "subscription.expiry": { $gte: now } }],
      }),
    ]);

    return {
      totalUsers,
      activeSubscribers,
      couponUsers,
      paidUsers,
      mrr: paidUsers * 100,
      totalSitesConnected: 0,
    };
  },
};
