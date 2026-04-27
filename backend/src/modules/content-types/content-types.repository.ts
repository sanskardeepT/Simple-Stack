import { ApiError } from "../../lib/errors.js";
import { ContentTypeModel } from "../../models/ContentType.js";
import { paginate } from "../../utils/query.util.js";

export const contentTypesRepository = {
  findAll(query: Record<string, unknown>, scope: Record<string, unknown>) {
    const filter: Record<string, unknown> = { ...scope };
    if (typeof query.search === "string" && query.search.trim()) {
      filter.$text = { $search: query.search.trim() };
    }
    return paginate(ContentTypeModel.find(filter).lean(), {
      page: query.page as string | number | undefined,
      limit: query.limit as string | number | undefined,
      sort: query.sort as string | undefined,
      order: query.order as "asc" | "desc" | undefined,
      allowedSort: ["createdAt", "updatedAt", "name"],
    });
  },
  findById(id: string, scope: Record<string, unknown>) {
    return ContentTypeModel.findOne({ _id: id, ...scope }).lean().orFail(new ApiError(404, "NOT_FOUND", "Content type not found")).exec();
  },
  create(data: Record<string, unknown>) {
    return ContentTypeModel.create(data);
  },
  update(id: string, data: Record<string, unknown>, scope: Record<string, unknown>) {
    return ContentTypeModel.findOneAndUpdate({ _id: id, ...scope }, data, { new: true, runValidators: true }).lean().exec();
  },
  delete(id: string, scope: Record<string, unknown>) {
    return ContentTypeModel.findOneAndDelete({ _id: id, ...scope }).lean().exec();
  },
};
