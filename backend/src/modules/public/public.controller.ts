import type { Request, Response } from "express";
import { ok } from "../../utils/response.util.js";
import { publicService } from "./public.service.js";

function apiKey(req: Request) {
  return (req.headers["x-simplestack-key"] as string | undefined) ?? (req.query.apiKey as string | undefined);
}

export const publicController = {
  async contentTypes(req: Request, res: Response): Promise<Response> {
    return ok(res, await publicService.contentTypes(String(req.params.projectId), apiKey(req)));
  },
  async entries(req: Request, res: Response): Promise<Response> {
    return ok(res, await publicService.entries(String(req.params.projectId), String(req.params.contentType), apiKey(req)));
  },
  async heartbeat(req: Request, res: Response): Promise<Response> {
    return ok(res, await publicService.heartbeat(String(req.params.projectId)));
  },
};
