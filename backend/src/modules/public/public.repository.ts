import { Types } from "mongoose";
import { ContentTypeModel } from "../../models/ContentType.js";
import { EntryModel } from "../../models/Entry.js";
import { ProjectModel } from "../../models/Project.js";
import type { ProjectLean } from "../projects/projects.repository.js";

export const publicRepository = {
  findProject(projectId: string) {
    return ProjectModel.findOne({ projectId }).select("+apiKey").lean<ProjectLean>().exec();
  },
  listContentTypes(projectRef: unknown) {
    return ContentTypeModel.find({ projectRef: new Types.ObjectId(String(projectRef)) })
      .select("name slug description fields updatedAt")
      .sort({ name: 1 })
      .lean()
      .exec();
  },
  listEntries(projectRef: unknown, contentTypeSlug: string) {
    return EntryModel.aggregate([
      {
        $match: {
          projectRef: new Types.ObjectId(String(projectRef)),
          status: "published",
        },
      },
      {
        $lookup: {
          from: "contenttypes",
          localField: "contentTypeId",
          foreignField: "_id",
          as: "contentType",
        },
      },
      { $unwind: "$contentType" },
      { $match: { "contentType.slug": contentTypeSlug } },
      {
        $project: {
          title: 1,
          slug: 1,
          fields: 1,
          publishedAt: 1,
          updatedAt: 1,
          contentType: "$contentType.slug",
        },
      },
      { $sort: { publishedAt: -1, updatedAt: -1 } },
    ]).exec();
  },
  touchConnected(projectId: string) {
    return ProjectModel.findOneAndUpdate({ projectId }, { $set: { connectedAt: new Date() } }, { new: true }).lean<ProjectLean>().exec();
  },
};
