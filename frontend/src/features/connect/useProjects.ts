import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ensureDefaultProjectApi, listProjectsApi, updateProjectWebhookApi, type Project } from "../../lib/api/projects.api.js";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await listProjectsApi();
      return response.data.data as Project[];
    },
  });
}

export function useEnsureDefaultProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await ensureDefaultProjectApi();
      return response.data.data as Project;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, webhookUrl }: { projectId: string; webhookUrl: string }) => {
      const response = await updateProjectWebhookApi(projectId, webhookUrl);
      return response.data.data as Project;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
