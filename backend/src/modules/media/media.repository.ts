import { ApiError } from "../../lib/errors.js";
import { MediaModel } from "../../models/Media.js";
import { paginate } from "../../utils/query.util.js";

export const mediaRepository = {
  findAll(query: Record<string, unknown>, scope: Record<string, unknown>) {
    const filter: Record<string, unknown> = { ...scope };
    if (typeof query.folder === "string" && query.folder.trim()) {
      filter.folder = query.folder.trim();
    }
    if (typeof query.mimeType === "string" && query.mimeType.trim()) {
      filter.mimeType = { $regex: query.mimeType.trim(), $options: "i" };
    }
    if (typeof query.search === "string" && query.search.trim()) {
      filter.$or = [
        { filename: { $regex: query.search.trim(), $options: "i" } },
        { originalName: { $regex: query.search.trim(), $options: "i" } },
      ];
    }
    return paginate(MediaModel.find(filter).lean(), {
      page: query.page as string | number | undefined,
      limit: query.limit as string | number | undefined,
      sort: query.sort as string | undefined,
      order: query.order as "asc" | "desc" | undefined,
      allowedSort: ["createdAt", "updatedAt", "filename", "size"],
    });
  },
  findById(id: string, scope: Record<string, unknown> = {}) {
    return MediaModel.findOne({ _id: id, ...scope }).lean().orFail(new ApiError(404, "NOT_FOUND", "Media not found")).exec();
  },
  create(data: Record<string, unknown>) {
    return MediaModel.create(data);
  },
  delete(id: string, scope: Record<string, unknown>) {
    return MediaModel.findOneAndDelete({ _id: id, ...scope }).lean().exec();
  },
  updateStatus(id: string, status: string) {
    return MediaModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean().exec();
  },
};
