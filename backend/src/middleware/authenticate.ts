import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../lib/errors.js";

type JwtPayload = {
  userId: string;
  role: "admin" | "editor" | "viewer";
  email: string;
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication token is required");
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token"));
  }
}
