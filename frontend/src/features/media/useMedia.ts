import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getApiError } from "../../lib/api/client.js";
import { deleteMediaApi, listMediaApi, uploadMediaApi } from "../../lib/api/media.api.js";

export type MediaInput = {
  _id?: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
};

export const mediaKeys = {
  all: ["media"] as const,
  detail: (id: string) => ["media", "detail", id] as const,
  list: (filters: Record<string, unknown>) => ["media", "list", filters] as const,
};

export function useMedia(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: async () => {
      const response = await listMediaApi(filters);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await uploadMediaApi(payload);
      return response.data.data as MediaInput;
    },
    onError: (error) => toast.error(getApiError(error)),
    onSuccess: (data) => {
      queryClient.setQueryData(mediaKeys.detail(String(data._id)), data);
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteMediaApi(id);
      return id;
    },
    onError: (error) => toast.error(getApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
