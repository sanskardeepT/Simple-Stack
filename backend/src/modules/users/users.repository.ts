import { ApiError } from "../../lib/errors.js";
import { UserModel } from "../../models/User.js";
import { paginate } from "../../utils/query.util.js";

export const usersRepository = {
  findAll(query: Record<string, unknown>) {
    const filter: Record<string, unknown> = {};
    if (typeof query.search === "string" && query.search.trim()) {
      filter.$or = [
        { name: { $regex: query.search.trim(), $options: "i" } },
        { email: { $regex: query.search.trim(), $options: "i" } },
      ];
    }

    return paginate(UserModel.find(filter).select("-passwordHash").lean(), {
      page: query.page as string | number | undefined,
      limit: query.limit as string | number | undefined,
      sort: query.sort as string | undefined,
      order: query.order as "asc" | "desc" | undefined,
      allowedSort: ["createdAt", "name", "email", "lastLoginAt"],
    });
  },
  findById(id: string) {
    return UserModel.findById(id).select("-passwordHash").lean().orFail(new ApiError(404, "NOT_FOUND", "User not found")).exec();
  },
  update(id: string, data: Record<string, unknown>) {
    return UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-passwordHash").lean().exec();
  },
};
