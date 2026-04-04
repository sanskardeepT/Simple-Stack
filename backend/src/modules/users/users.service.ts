import { ApiError } from "../../lib/errors.js";
import { usersRepository } from "./users.repository.js";

export const usersService = {
  list(query: Record<string, unknown>) {
    return usersRepository.findAll(query);
  },
  getOne(id: string) {
    return usersRepository.findById(id);
  },
  async update(id: string, dto: { role?: "admin" | "editor" | "viewer"; isActive?: boolean }) {
    const updated = await usersRepository.update(id, dto);
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }
    return updated;
  },
};
