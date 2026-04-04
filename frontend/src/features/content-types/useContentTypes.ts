import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api, getApiError } from "../../lib/api/client.js";

type ContentTypeInput = {
  _id?: string;
  name: string;
  slug?: string;
  fields?: Array<Record<string, unknown>>;
};

export const contentTypeKeys = {
  all: ["content-types"] as const,
  detail: (id: string) => ["content-types", "detail", id] as const,
  list: (filters: Record<string, unknown>) => ["content-types", "list", filters] as const,
};

export function useContentTypes(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: contentTypeKeys.list(filters),
    queryFn: async () => {
      const response = await api.get("/content-types", { params: filters });
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUpdateContentType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<ContentTypeInput>) => {
      const response = await api.put(`/content-types/${id}`, payload);
      return response.data.data as ContentTypeInput;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: contentTypeKeys.detail(id) });
      const previous = queryClient.getQueryData<ContentTypeInput>(contentTypeKeys.detail(id));
      if (previous) {
        queryClient.setQueryData(contentTypeKeys.detail(id), { ...previous, ...payload });
      }
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(contentTypeKeys.detail(id), context.previous);
      }
      toast.error(getApiError(error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.all });
    },
  });
}
