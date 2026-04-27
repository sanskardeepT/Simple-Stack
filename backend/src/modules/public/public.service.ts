import { ApiError } from "../../lib/errors.js";
import { publicRepository } from "./public.repository.js";

function verifyApiKey(project: { apiKey?: string }, apiKey?: string) {
  if (!apiKey || project.apiKey !== apiKey) {
    throw new ApiError(401, "PUBLIC_API_KEY_INVALID", "Public API key is missing or invalid");
  }
}

export const publicService = {
  async contentTypes(projectId: string, apiKey?: string) {
    const project = await publicRepository.findProject(projectId);
    if (!project) {
      throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    verifyApiKey(project, apiKey);
    await publicRepository.touchConnected(projectId);
    return publicRepository.listContentTypes(project._id);
  },
  async entries(projectId: string, contentTypeSlug: string, apiKey?: string) {
    const project = await publicRepository.findProject(projectId);
    if (!project) {
      throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    verifyApiKey(project, apiKey);
    await publicRepository.touchConnected(projectId);
    return publicRepository.listEntries(project._id, contentTypeSlug);
  },
  async heartbeat(projectId: string) {
    const project = await publicRepository.touchConnected(projectId);
    if (!project) {
      throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    return { connected: true, connectedAt: project.connectedAt };
  },
};
