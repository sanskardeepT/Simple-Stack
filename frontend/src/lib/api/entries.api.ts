import { api } from "./client.js";

export function listEntriesApi(params?: Record<string, unknown>) {
  return api.get("/entries", { params });
}

export function getEntryApi(id: string) {
  return api.get(`/entries/${id}`);
}

export function createEntryApi(payload: Record<string, unknown>) {
  return api.post("/entries", payload);
}

export function updateEntryApi(id: string, payload: Record<string, unknown>) {
  return api.put(`/entries/${id}`, payload);
}

export function deleteEntryApi(id: string) {
  return api.delete(`/entries/${id}`);
}

export function relatedEntriesApi(id: string) {
  return api.get(`/entries/${id}/related`);
}
