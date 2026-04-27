import { api } from "./client.js";

export type Project = {
  _id: string;
  name: string;
  projectId: string;
  apiKey: string;
  connectedAt: string | null;
  webhookUrl: string;
  connected: boolean;
  embedSnippet: string;
};

export function listProjectsApi() {
  return api.get("/projects");
}

export function ensureDefaultProjectApi() {
  return api.post("/projects/default", {});
}

export function updateProjectWebhookApi(projectId: string, webhookUrl: string) {
  return api.patch(`/projects/${projectId}/webhook`, { webhookUrl });
}
