import { api } from "./client.js";

export function listMediaApi(params?: Record<string, unknown>) {
  return api.get("/media", { params });
}

export function uploadMediaApi(formData: FormData) {
  return api.post("/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteMediaApi(id: string) {
  return api.delete(`/media/${id}`);
}
