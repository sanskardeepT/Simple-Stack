import { randomBytes } from "node:crypto";
import { EntryModel } from "../models/Entry.js";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export async function generateUniqueSlug(
  title: string,
  contentTypeId: string,
  existingId?: string,
): Promise<string> {
  const baseSlug = generateSlug(title);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    const existing = await EntryModel.findOne({
      slug: candidate,
      contentTypeId,
      ...(existingId ? { _id: { $ne: existingId } } : {}),
    })
      .lean()
      .exec();

    if (!existing) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomBytes(2).toString("hex")}`;
}
