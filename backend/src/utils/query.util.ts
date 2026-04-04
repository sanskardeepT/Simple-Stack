import type { FilterQuery, Model, Query } from "mongoose";

type ListQuery = {
  contentTypeId?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number | string;
  order?: "asc" | "desc";
  page?: number | string;
  search?: string;
  sort?: string;
  status?: string;
  tags?: string[] | string;
};

type PaginateOptions = {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: "asc" | "desc";
  allowedSort?: readonly string[];
};

export async function paginate<T>(
  query: Query<T[], unknown>,
  opts: PaginateOptions,
): Promise<{
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const allowedSort = opts.allowedSort ?? ["createdAt", "updatedAt"];
  const page = Math.max(1, Number(opts.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(opts.limit ?? 20)));
  const sortField = allowedSort.includes(opts.sort ?? "") ? (opts.sort ?? "createdAt") : "createdAt";
  const sortDirection = opts.order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query.clone().sort({ [sortField]: sortDirection }).skip(skip).limit(limit).exec(),
    query.model.countDocuments(query.getFilter()),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function buildFilter<T>(query: ListQuery): FilterQuery<T> {
  const filter: Record<string, unknown> = {};

  if (typeof query.status === "string" && query.status.trim()) {
    filter.status = query.status.trim() as FilterQuery<T>[keyof T];
  }

  if (typeof query.contentTypeId === "string" && query.contentTypeId.trim()) {
    filter.contentTypeId = query.contentTypeId.trim() as FilterQuery<T>[keyof T];
  }

  if (typeof query.search === "string" && query.search.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  const tags = Array.isArray(query.tags)
    ? query.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    : typeof query.tags === "string"
      ? query.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  if (tags.length > 0) {
    filter.tags = { $in: tags } as FilterQuery<T>[keyof T];
  }

  if (query.createdFrom || query.createdTo) {
    filter.createdAt = {
      ...(query.createdFrom ? { $gte: new Date(query.createdFrom) } : {}),
      ...(query.createdTo ? { $lte: new Date(query.createdTo) } : {}),
    } as FilterQuery<T>[keyof T];
  }

  return filter as FilterQuery<T>;
}

export function buildModelQuery<T>(model: Model<T>, query: ListQuery) {
  return model.find(buildFilter<T>(query)).lean();
}
