import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStore } from "../store/auth.store.js";

export type ApiClientError = {
  code?: string;
  message: string;
  status?: number;
};

type RefreshResponse = {
  success: true;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      role: "superadmin" | "user";
    };
    accessToken: string;
  };
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: ApiClientError) => void;
}> = [];

function normalizeError(error: unknown): ApiClientError {
  if (axios.isAxiosError(error)) {
    return {
      code: error.response?.data?.code as string | undefined,
      message: (error.response?.data?.message as string | undefined) ?? error.message,
      status: error.response?.status,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Request failed",
  };
}

export function getApiError(error: unknown): string {
  return normalizeError(error).message;
}

function clearQueue(error?: ApiClientError, token?: string): void {
  queue.forEach((item) => {
    if (token) {
      item.resolve(token);
    } else {
      item.reject(error ?? { message: "Authentication failed" });
    }
  });
  queue = [];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const normalized = normalizeError(error);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? "").includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post<RefreshResponse>("/auth/refresh");
        authStore.getState().setAuth(refreshResponse.data.data.user, refreshResponse.data.data.accessToken);
        clearQueue(undefined, refreshResponse.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const refreshNormalized = normalizeError(refreshError);
        clearQueue(refreshNormalized);
        authStore.getState().clearAuth();
        window.location.assign("/login");
        return Promise.reject(refreshNormalized);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalized);
  },
);

export { api };
