import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { ok } from "../../utils/response.util.js";
import { projectsService } from "./projects.service.js";

export const projectsController = {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "AUTH_REQUIRED", "Authentication required");
    }
    return ok(res, await projectsService.list(req.user.userId));
  },
  async ensureDefault(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "AUTH_REQUIRED", "Authentication required");
    }
    return ok(res, await projectsService.ensureDefaultProject(req.user.userId));
  },
  async updateWebhook(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "AUTH_REQUIRED", "Authentication required");
    }
    return ok(res, await projectsService.updateWebhook(req.user.userId, String(req.params.projectId), req.body.webhookUrl));
  },
};
