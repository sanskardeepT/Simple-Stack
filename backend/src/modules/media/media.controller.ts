import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { created, noContent, ok, paginated } from "../../utils/response.util.js";
import { mediaService } from "./media.service.js";

export const mediaController = {
  async list(req: Request, res: Response): Promise<Response> {
    return paginated(res, await mediaService.list(req.query as Record<string, unknown>));
  },
  async getOne(req: Request, res: Response): Promise<Response> {
    return ok(res, await mediaService.getOne(String(req.params.id)));
  },
  async create(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return created(res, await mediaService.create(req.file, req.body, req.user.userId));
  },
  async remove(req: Request, res: Response): Promise<Response> {
    await mediaService.remove(String(req.params.id));
    return noContent(res);
  },
};
