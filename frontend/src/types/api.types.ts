export type ApiSuccess<T> = {
  status: "success";
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  status: "error";
  code: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
