import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { noContent, ok, paginated } from "../../utils/response.util.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async dashboard(_req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.dashboard());
  },
  async list(req: Request, res: Response): Promise<Response> {
    return paginated(res, await usersService.list(req.query as Record<string, unknown>));
  },
  async exportCsv(req: Request, res: Response): Promise<Response> {
    const csv = await usersService.exportCsv(req.query as Record<string, unknown>);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="simplestack-users-${Date.now()}.csv"`);
    return res.status(200).send(csv);
  },
  async getOne(req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.getOne(String(req.params.id)));
  },
  async update(req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.update(String(req.params.id), req.body));
  },
  async activateSubscription(req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.activateSubscription(String(req.params.id), req.body));
  },
  async deactivateSubscription(req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.deactivateSubscription(String(req.params.id)));
  },
  async delete(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "AUTH_REQUIRED", "Authentication required");
    }
    await usersService.delete(String(req.params.id), req.user.userId);
    return noContent(res);
  },
};
