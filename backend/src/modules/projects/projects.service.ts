import { ApiError } from "../../lib/errors.js";
import { projectsRepository, type ProjectLean } from "./projects.repository.js";

function serializeProject(project: ProjectLean) {
  const connectedAt = project.connectedAt ? new Date(String(project.connectedAt)) : null;
  return {
    _id: String(project._id),
    name: project.name,
    projectId: project.projectId,
    apiKey: project.apiKey,
    connectedAt,
    webhookUrl: project.webhookUrl ?? "",
    connected: connectedAt ? Date.now() - connectedAt.getTime() < 24 * 60 * 60 * 1000 : false,
    embedSnippet: `<script src="https://cdn.simplestack.in/connect.js" data-project="${project.projectId}" data-api-key="${project.apiKey}"></script>`,
  };
}

export const projectsService = {
  async ensureDefaultProject(userId: string) {
    const existing = await projectsRepository.findOneByUser(userId);
    if (existing) return serializeProject(existing);

    const created = await projectsRepository.createDefault(userId);
    return serializeProject(created.toObject() as ProjectLean);
  },
  async list(userId: string) {
    const projects = await projectsRepository.findByUser(userId);
    if (projects.length === 0) {
      return [await this.ensureDefaultProject(userId)];
    }
    return projects.map((project) => serializeProject(project));
  },
  async updateWebhook(userId: string, projectId: string, webhookUrl: string) {
    const updated = await projectsRepository.updateWebhook(projectId, userId, webhookUrl);
    if (!updated) {
      throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found");
    }
    return serializeProject(updated);
  },
};
