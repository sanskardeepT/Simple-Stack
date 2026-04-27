import { Types } from "mongoose";
import { UserModel } from "../../models/User.js";

type SubscriptionUserLean = {
  _id: unknown;
  name: string;
  email: string;
  role: "superadmin" | "user";
  subscription?: {
    status: "inactive" | "active" | "expired" | "cancelled";
    plan: "none" | "paid" | "coupon" | "free_trial";
    expiry?: Date | null;
    coupon?: string;
  } | null;
};

export const subscriptionRepository = {
  findUser(userId: string) {
    return UserModel.findById(userId).lean<SubscriptionUserLean>().exec();
  },
  activateCoupon(userId: string, coupon: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          "subscription.status": "active",
          "subscription.plan": "coupon",
          "subscription.expiry": null,
          "subscription.coupon": coupon,
        },
      },
      { new: true },
    ).lean<SubscriptionUserLean>().exec();
  },
  activatePaid(userId: string, months = 1) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    return UserModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      {
        $set: {
          "subscription.status": "active",
          "subscription.plan": "paid",
          "subscription.expiry": expiry,
          "subscription.coupon": "",
        },
      },
      { new: true },
    ).lean<SubscriptionUserLean>().exec();
  },
  deactivate(userId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { "subscription.status": "cancelled" } },
      { new: true },
    ).lean<SubscriptionUserLean>().exec();
  },
};
