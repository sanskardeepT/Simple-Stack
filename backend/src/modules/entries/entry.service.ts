import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { analyticsQueue } from "../../jobs/queue.js";
import { getCache, invalidatePattern, setCache } from "../../lib/cache.js";
import { ApiError } from "../../lib/errors.js";
import { ContentTypeModel } from "../../models/ContentType.js";
import { generateUniqueSlug } from "../../utils/slug.util.js";
import { sortBySimilarity } from "../../utils/similarity.util.js";
import { entryRepository } from "./entry.repository.js";

function validateFieldsAgainstSchema(
  contentType: { fields: Array<{ name: string; required?: boolean; type: string }> },
  fields: Record<string, unknown>,
): void {
  for (const definition of contentType.fields) {
    const value = fields[definition.name];
    if (definition.required && (value === undefined || value === null || value === "")) {
      throw new ApiError(400, "INVALID_FIELDS", `Field "${definition.name}" is required`);
    }
    if (value === undefined || value === null) {
      continue;
    }
    if (definition.type === "number" && typeof value !== "number") {
      throw new ApiError(400, "INVALID_FIELDS", `Field "${definition.name}" must be a number`);
    }
    if (definition.type === "boolean" && typeof value !== "boolean") {
      throw new ApiError(400, "INVALID_FIELDS", `Field "${definition.name}" must be a boolean`);
    }
    if (definition.type === "date" && Number.isNaN(new Date(String(value)).getTime())) {
      throw new ApiError(400, "INVALID_FIELDS", `Field "${definition.name}" must be a valid date`);
    }
  }
}

type LeanContentType = {
  _id: unknown;
  fields: Array<{ name: string; required?: boolean; type: string }>;
};

export const entryService = {
  async listEntries(query: Record<string, unknown>) {
    const cacheKey = `entries:list:${JSON.stringify(query)}`;
    const cached = await getCache<Awaited<ReturnType<typeof entryRepository.findAll>>>(cacheKey);
    if (cached) {
      return cached;
    }

    if (typeof query.contentTypeId === "string" && query.contentTypeId) {
      const exists = await ContentTypeModel.exists({ _id: new Types.ObjectId(query.contentTypeId) });
      if (!exists) {
        throw new ApiError(404, "NOT_FOUND", "Content type not found");
      }
    }

    const result = await entryRepository.findAll(query);
    await setCache(cacheKey, result, 30);
    return result;
  },
  async getEntry(id: string) {
    const cacheKey = `entries:detail:${id}`;
    const cached = await getCache<Awaited<ReturnType<typeof entryRepository.findById>>>(cacheKey);
    if (cached) {
      return cached;
    }

    const entry = await entryRepository.findById(id);
    await setCache(cacheKey, entry, 60);
    return entry;
  },
  async createEntry(
    dto: { title: string; contentTypeId: string; fields: Record<string, unknown>; status: "draft" | "published" | "archived"; tags?: string[] },
    user: { userId: string },
  ) {
    const contentType = await ContentTypeModel.findById(dto.contentTypeId).lean<LeanContentType>().exec();
    if (!contentType) {
      throw new ApiError(404, "NOT_FOUND", "Content type not found");
    }

    validateFieldsAgainstSchema(contentType, dto.fields);
    const slug = await generateUniqueSlug(dto.title, dto.contentTypeId);
    const created = await entryRepository.create({
      ...dto,
      contentTypeId: new Types.ObjectId(dto.contentTypeId),
      createdBy: new Types.ObjectId(user.userId),
      publishedAt: dto.status === "published" ? new Date() : undefined,
      slug,
    });
    await invalidatePattern("entries:list:*");
    return created.toObject();
  },
  async updateEntry(
    id: string,
    dto: { title?: string; contentTypeId?: string; fields?: Record<string, unknown>; status?: "draft" | "published" | "archived"; tags?: string[] },
    user: { userId: string; role: "admin" | "editor" | "viewer" },
  ) {
    const existing = await entryRepository.findById(id);
    if (String(existing.createdBy) !== user.userId && user.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "You do not own this entry");
    }

    const nextContentTypeId = dto.contentTypeId ?? String(existing.contentTypeId);
    const contentType = await ContentTypeModel.findById(nextContentTypeId).lean<LeanContentType>().exec();
    if (!contentType) {
      throw new ApiError(404, "NOT_FOUND", "Content type not found");
    }

    if (dto.fields) {
      validateFieldsAgainstSchema(contentType, dto.fields);
    }

    const updated = await entryRepository.update(id, {
      ...dto,
      ...(dto.title ? { slug: await generateUniqueSlug(dto.title, nextContentTypeId, id) } : {}),
      ...(dto.status === "published" && !existing.publishedAt ? { publishedAt: new Date() } : {}),
    });

    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "Entry not found");
    }

    await Promise.all([invalidatePattern("entries:list:*"), invalidatePattern(`entries:detail:${id}`)]);
    return updated;
  },
  async deleteEntry(id: string, user: { userId: string; role: "admin" | "editor" | "viewer" }) {
    const existing = await entryRepository.findById(id);
    if (String(existing.createdBy) !== user.userId && user.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "You do not own this entry");
    }
    const archived = await entryRepository.softDelete(id);
    await Promise.all([invalidatePattern("entries:list:*"), invalidatePattern(`entries:detail:${id}`)]);
    return archived;
  },
  async trackView(id: string, sessionId: string, userId?: string): Promise<{ queued: true }> {
    await entryRepository.incrementViewCount(id);
    await analyticsQueue.add("track-view", {
      event: "view",
      entityType: "entry",
      entityId: id,
      userId,
      sessionId: sessionId || randomUUID(),
      ip: "",
      meta: {},
    });
    await invalidatePattern(`entries:detail:${id}`);
    return { queued: true };
  },
  async getSimilarEntries(id: string) {
    const entry = await entryRepository.findById(id);
    const related = await entryRepository.findRelated(entry.tags ?? [], String(entry.contentTypeId), id, 5);
    return sortBySimilarity(
      related.map((item: { tags?: string[] } & Record<string, unknown>) => ({ ...item, tags: item.tags ?? [] })),
      entry.tags ?? [],
    );
  },
};
