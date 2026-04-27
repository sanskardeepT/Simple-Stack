import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/errors.js";

export type Permission =
  | "content:read"
  | "content:write"
  | "content:delete"
  | "media:upload"
  | "media:delete"
  | "settings:manage"
  | "users:manage"
  | "analytics:read";

const ALL_PERMISSIONS: Permission[] = [
  "content:read",
  "content:write",
  "content:delete",
  "media:upload",
  "media:delete",
  "settings:manage",
  "users:manage",
  "analytics:read",
];

export const ROLE_PERMISSIONS: Record<"superadmin" | "user", Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  user: ["content:read", "content:write", "content:delete", "media:upload", "media:delete", "settings:manage", "analytics:read"],
};

export function authorize(...perms: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }

    const permissions = ROLE_PERMISSIONS[req.user.role];
    const allowed = perms.every((permission) => permissions.includes(permission));

    if (!allowed) {
      next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}
