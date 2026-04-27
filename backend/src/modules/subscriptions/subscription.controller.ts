import type { Request, Response } from "express";
import { ApiError } from "../../lib/errors.js";
import { ok } from "../../utils/response.util.js";
import { subscriptionService } from "./subscription.service.js";

function requireUser(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "AUTH_REQUIRED", "Authentication required");
  }

  return req.user;
}

export const subscriptionController = {
  async status(req: Request, res: Response): Promise<Response> {
    const user = requireUser(req);
    return ok(res, await subscriptionService.status(user.userId));
  },
  async applyCoupon(req: Request, res: Response): Promise<Response> {
    const user = requireUser(req);
    return ok(res, await subscriptionService.applyCoupon(user.userId, req.body.code));
  },
  async checkout(req: Request, res: Response): Promise<Response> {
    const user = requireUser(req);
    return ok(res, await subscriptionService.createCheckout(user.userId));
  },
  async verifyPayment(req: Request, res: Response): Promise<Response> {
    const user = requireUser(req);
    return ok(res, await subscriptionService.verifyPayment(user.userId, req.body));
  },
  async webhook(req: Request, res: Response): Promise<Response> {
    const signature = req.headers["x-razorpay-signature"];
    return ok(
      res,
      await subscriptionService.handleWebhook(
        Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body)),
        Array.isArray(signature) ? signature[0] : signature,
      ),
    );
  },
};
