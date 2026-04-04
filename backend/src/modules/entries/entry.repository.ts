import { Types } from "mongoose";
import { ApiError } from "../../lib/errors.js";
import { EntryModel } from "../../models/Entry.js";
import { buildFilter, paginate } from "../../utils/query.util.js";

type LeanEntry = {
  _id: unknown;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  contentTypeId: unknown;
  fields: Record<string, unknown>;
  publishedAt?: Date;
  createdBy: unknown;
  viewCount: number;
  tags?: string[];
};

export const entryRepository = {
  async findAll(query: Record<string, unknown>) {
    const filter = buildFilter(query as Parameters<typeof buildFilter>[0]);
    return paginate(EntryModel.find(filter).lean(), {
      page: query.page as string | number | undefined,
      limit: query.limit as string | number | undefined,
      sort: query.sort as string | undefined,
      order: query.order as "asc" | "desc" | undefined,
      allowedSort: ["createdAt", "updatedAt", "title", "publishedAt", "viewCount"],
    });
  },
  findById(id: string) {
    return EntryModel.findById(id).lean<LeanEntry>().orFail(new ApiError(404, "NOT_FOUND", "Entry not found")).exec();
  },
  findBySlug(slug: string, contentTypeId: string) {
    return EntryModel.findOne({ slug, contentTypeId }).lean<LeanEntry>().exec();
  },
  create(data: Record<string, unknown>) {
    return EntryModel.create(data);
  },
  update(id: string, data: Record<string, unknown>) {
    return EntryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean<LeanEntry>().exec();
  },
  softDelete(id: string) {
    return EntryModel.findByIdAndUpdate(id, { $set: { status: "archived" } }, { new: true }).lean<LeanEntry>().exec();
  },
  incrementViewCount(id: string) {
    return EntryModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec();
  },
  findRelated(tags: string[], contentTypeId: string, excludeId: string, limit = 5) {
    return EntryModel.find({
      _id: { $ne: new Types.ObjectId(excludeId) },
      contentTypeId: new Types.ObjectId(contentTypeId),
      status: "published",
      tags: { $in: tags },
    })
      .sort({ viewCount: -1 })
      .limit(limit)
      .lean<LeanEntry[]>()
      .exec();
  },
};
