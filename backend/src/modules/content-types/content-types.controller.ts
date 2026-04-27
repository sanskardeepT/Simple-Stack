import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { created, noContent, ok, paginated } from "../../utils/response.util.js";
import { contentTypesService } from "./content-types.service.js";

export const contentTypesController = {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return paginated(res, await contentTypesService.list(req.query as Record<string, unknown>, req.user));
  },
  async getOne(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await contentTypesService.getOne(String(req.params.id), req.user));
  },
  async create(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return created(res, await contentTypesService.create(req.body, req.user.userId));
  },
  async update(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await contentTypesService.update(String(req.params.id), req.body, req.user));
  },
  async remove(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    await contentTypesService.remove(String(req.params.id), req.user);
    return noContent(res);
  },
};
