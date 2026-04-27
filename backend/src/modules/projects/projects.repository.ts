import { randomBytes, randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { ProjectModel } from "../../models/Project.js";

export type ProjectLean = {
  _id: unknown;
  userId: unknown;
  name: string;
  projectId: string;
  apiKey: string;
  connectedAt?: Date | null;
  webhookUrl?: string;
};

function createPublicProjectId() {
  return `proj_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

function createApiKey() {
  return `ss_live_${randomBytes(24).toString("hex")}`;
}

export const projectsRepository = {
  findByUser(userId: string) {
    return ProjectModel.find({ userId: new Types.ObjectId(userId) }).select("+apiKey").sort({ createdAt: 1 }).lean<ProjectLean[]>().exec();
  },
  findOneByUser(userId: string) {
    return ProjectModel.findOne({ userId: new Types.ObjectId(userId) }).select("+apiKey").sort({ createdAt: 1 }).lean<ProjectLean>().exec();
  },
  findByProjectId(projectId: string) {
    return ProjectModel.findOne({ projectId }).select("+apiKey").lean<ProjectLean>().exec();
  },
  createDefault(userId: string, name = "My Website") {
    return ProjectModel.create({
      userId: new Types.ObjectId(userId),
      name,
      projectId: createPublicProjectId(),
      apiKey: createApiKey(),
    });
  },
  touchConnected(projectId: string) {
    return ProjectModel.findOneAndUpdate({ projectId }, { $set: { connectedAt: new Date() } }, { new: true }).lean<ProjectLean>().exec();
  },
  updateWebhook(projectId: string, userId: string, webhookUrl: string) {
    return ProjectModel.findOneAndUpdate(
      { projectId, userId: new Types.ObjectId(userId) },
      { $set: { webhookUrl } },
      { new: true },
    ).select("+apiKey").lean<ProjectLean>().exec();
  },
};
