import type { Response } from "express";

export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>): Response {
  return res.status(200).json({
    success: true,
    data,
    message: "OK",
    ...(meta ? { meta } : {}),
  });
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({
    success: true,
    data,
    message: "Created",
  });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function paginated<T>(
  res: Response,
  result: { data: T; meta: Record<string, unknown> },
): Response {
  return ok(res, result.data, result.meta);
}
