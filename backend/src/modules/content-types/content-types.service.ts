import { invalidatePattern } from "../../lib/cache.js";
import { ApiError } from "../../lib/errors.js";
import { generateSlug } from "../../utils/slug.util.js";
import { projectsRepository } from "../projects/projects.repository.js";
import { contentTypesRepository } from "./content-types.repository.js";

function validateDuplicateFields(fields: Array<{ name: string }>): void {
  const seen = new Set<string>();
  for (const field of fields) {
    const normalized = field.name.trim().toLowerCase();
    if (seen.has(normalized)) {
      throw new ApiError(400, "DUPLICATE_FIELD", `Duplicate field name "${field.name}"`);
    }
    seen.add(normalized);
  }
}

function ownerScope(user: { userId: string; role: "superadmin" | "user" }) {
  return user.role === "superadmin" ? {} : { createdBy: user.userId };
}

export const contentTypesService = {
  list(query: Record<string, unknown>, user: { userId: string; role: "superadmin" | "user" }) {
    return contentTypesRepository.findAll(query, ownerScope(user));
  },
  getOne(id: string, user: { userId: string; role: "superadmin" | "user" }) {
    return contentTypesRepository.findById(id, ownerScope(user));
  },
  async create(dto: { name: string; description?: string; fields: Array<{ name: string; type: string; required?: boolean; defaultValue?: unknown; options?: unknown }> }, userId: string) {
    validateDuplicateFields(dto.fields);
    const project = await projectsRepository.findOneByUser(userId) ?? await projectsRepository.createDefault(userId);
    const created = await contentTypesRepository.create({
      ...dto,
      slug: generateSlug(dto.name),
      createdBy: userId,
      projectRef: project._id,
    });
    return created.toObject();
  },
  async update(id: string, dto: { name?: string; description?: string; fields?: Array<{ name: string }> }, user: { userId: string; role: "superadmin" | "user" }) {
    if (dto.fields) {
      validateDuplicateFields(dto.fields);
    }
    const updated = await contentTypesRepository.update(id, {
      ...dto,
      ...(dto.name ? { slug: generateSlug(dto.name) } : {}),
    }, ownerScope(user));
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "Content type not found");
    }
    await invalidatePattern("entries:list:*");
    return updated;
  },
  async remove(id: string, user: { userId: string; role: "superadmin" | "user" }) {
    const removed = await contentTypesRepository.delete(id, ownerScope(user));
    if (!removed) {
      throw new ApiError(404, "NOT_FOUND", "Content type not found");
    }
    await invalidatePattern("entries:list:*");
    return removed;
  },
};
