import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { created, noContent, ok } from "../../utils/response.util.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(req: Request, res: Response): Promise<Response> {
    const result = await authService.register(req.body);
    return created(res, result);
  },
  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const result = await authService.verifyOtp(req.body);
    if (result.refreshToken) {
      authService.setRefreshCookie(res, result.refreshToken);
    }
    return ok(res, {
      user: result.user,
      accessToken: result.accessToken,
      verified: !result.accessToken ? "partial" : "complete",
    });
  },
  async resendOtp(req: Request, res: Response): Promise<Response> {
    return ok(res, await authService.resendOtp(req.body));
  },
  async login(req: Request, res: Response): Promise<Response> {
    const result = await authService.login(req.body.email, req.body.password);
    authService.setRefreshCookie(res, result.refreshToken);
    return ok(res, { user: result.user, accessToken: result.accessToken });
  },
  async refresh(req: Request, res: Response): Promise<Response> {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "Refresh token cookie is missing");
    }
    const result = await authService.refresh(token);
    authService.setRefreshCookie(res, result.refreshToken);
    return ok(res, { user: result.user, accessToken: result.accessToken });
  },
  async logout(req: Request, res: Response): Promise<Response> {
    await authService.logout(req.cookies?.refreshToken as string | undefined);
    authService.clearRefreshCookie(res);
    return noContent(res);
  },
  async me(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await authService.me(req.user.userId));
  },
  async changePassword(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return ok(res, await authService.changePassword(req.user.userId, req.body.currentPassword, req.body.newPassword));
  },
};
