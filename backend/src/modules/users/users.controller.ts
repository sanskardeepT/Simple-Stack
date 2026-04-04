import type { Request, Response } from "express";
import { ok, paginated } from "../../utils/response.util.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async list(req: Request, res: Response): Promise<Response> {
    return paginated(res, await usersService.list(req.query as Record<string, unknown>));
  },
  async getOne(req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.getOne(String(req.params.id)));
  },
  async update(req: Request, res: Response): Promise<Response> {
    return ok(res, await usersService.update(String(req.params.id), req.body));
  },
};
