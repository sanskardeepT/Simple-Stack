import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { noContent, ok, paginated } from "../../utils/response.util.js";
import { entryService } from "./entry.service.js";

export const entryController = {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return paginated(res, await entryService.listEntries(req.query as Record<string, unknown>, req.user));
  },
  async getOne(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await entryService.getEntry(String(req.params.id), req.user));
  },
  async create(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await entryService.createEntry(req.body, req.user));
  },
  async update(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await entryService.updateEntry(String(req.params.id), req.body, req.user));
  },
  async remove(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    await entryService.deleteEntry(String(req.params.id), req.user);
    return noContent(res);
  },
  async related(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await entryService.getSimilarEntries(String(req.params.id), req.user));
  },
  async trackView(req: Request, res: Response): Promise<Response> {
    return ok(
      res,
      await entryService.trackView(String(req.params.id), String(req.body.sessionId ?? ""), req.user?.userId),
    );
  },
};
