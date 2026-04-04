import type { Request, Response } from "express";
import { ok } from "../../utils/response.util.js";
import { analyticsService } from "./analytics.service.js";

export const analyticsController = {
  async dashboard(req: Request, res: Response): Promise<Response> {
    const range = (req.query.range as "7d" | "30d" | "90d" | undefined) ?? "7d";
    return ok(res, await analyticsService.getDashboard(range));
  },
  async trending(_req: Request, res: Response): Promise<Response> {
    return ok(res, await analyticsService.getTrending());
  },
  async activity(_req: Request, res: Response): Promise<Response> {
    return ok(res, await analyticsService.getActivityFeed());
  },
  async event(req: Request, res: Response): Promise<Response> {
    return ok(res, await analyticsService.trackEvent(req.body));
  },
};
