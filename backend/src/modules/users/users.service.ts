import { ApiError } from "../../lib/errors.js";
import { env } from "../../config/env.js";
import { usersRepository } from "./users.repository.js";

function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export const usersService = {
  dashboard() {
    return usersRepository.dashboard();
  },
  async list(query: Record<string, unknown>) {
    const result = await usersRepository.findAll(query);
    const enriched = await Promise.all(
      result.data.map(async (user) => ({
        ...user,
        counts: await usersRepository.getCounts(String(user._id)),
      })),
    );

    return { ...result, data: enriched };
  },
  async getOne(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    return {
      ...user,
      counts: await usersRepository.getCounts(id),
    };
  },
  async update(id: string, dto: { name?: string; email?: string; phone?: string; isActive?: boolean }) {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    if (existing.role === "superadmin" && dto.isActive === false) {
      throw new ApiError(400, "SUPERADMIN_LOCKED", "Superadmin account cannot be deactivated");
    }

    const updated = await usersRepository.update(id, dto);
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }
    return updated;
  },
  async activateSubscription(id: string, dto: { months?: number; plan?: "paid" | "coupon" | "free_trial" }) {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    const updated = await usersRepository.activateSubscription(id, {
      months: dto.months ?? 1,
      plan: dto.plan ?? "paid",
      coupon: dto.plan === "coupon" ? env.COUPON_CODE : "",
    });
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }
    return updated;
  },
  async deactivateSubscription(id: string) {
    const updated = await usersRepository.deactivateSubscription(id);
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }
    return updated;
  },
  async delete(id: string, actorId: string) {
    if (id === actorId) {
      throw new ApiError(400, "SELF_DELETE_BLOCKED", "You cannot delete your own account");
    }

    const existing = await usersRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    if (existing.role === "superadmin") {
      throw new ApiError(400, "SUPERADMIN_LOCKED", "Superadmin account cannot be deleted");
    }

    await usersRepository.delete(id);
    return { deleted: true };
  },
  async exportCsv(query: Record<string, unknown>) {
    const users = await usersRepository.findRaw(usersRepository.buildFilter(query));
    const rows = [
      ["Name", "Email", "Phone", "Role", "Subscription Status", "Plan", "Expiry", "Coupon", "Last Login", "Created At"],
      ...users.map((user) => [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.subscription?.status ?? "inactive",
        user.subscription?.plan ?? "none",
        user.subscription?.expiry ? new Date(user.subscription.expiry).toISOString() : "",
        user.subscription?.coupon ?? "",
        user.lastLogin ? new Date(user.lastLogin).toISOString() : "",
        user.createdAt ? new Date(user.createdAt).toISOString() : "",
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  },
};
