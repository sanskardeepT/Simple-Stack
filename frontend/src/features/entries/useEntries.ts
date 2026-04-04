import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getApiError } from "../../lib/api/client.js";
import { createEntryApi, deleteEntryApi, getEntryApi, listEntriesApi, updateEntryApi } from "../../lib/api/entries.api.js";

export type EntryInput = {
  _id?: string;
  title: string;
  slug?: string;
  status?: string;
  fields?: Record<string, unknown>;
};

export const entryKeys = {
  all: ["entries"] as const,
  detail: (id: string) => ["entries", "detail", id] as const,
  list: (filters: Record<string, unknown>) => ["entries", "list", filters] as const,
};

export function useEntries(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: entryKeys.list(filters),
    queryFn: async () => {
      const response = await listEntriesApi(filters);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: entryKeys.detail(id),
    queryFn: async () => {
      const response = await getEntryApi(id);
      return response.data.data as EntryInput;
    },
    staleTime: 30_000,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<EntryInput, "_id">) => {
      const response = await createEntryApi(payload);
      return response.data.data as EntryInput;
    },
    onError: (error) => toast.error(getApiError(error)),
    onSuccess: (data) => {
      queryClient.setQueryData(entryKeys.detail(String(data._id)), data);
      queryClient.invalidateQueries({ queryKey: entryKeys.all });
    },
  });
}

export function useUpdateEntry(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<EntryInput>) => {
      const response = await updateEntryApi(id, payload);
      return response.data.data as EntryInput;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.detail(id) });
      const previous = queryClient.getQueryData<EntryInput>(entryKeys.detail(id));
      if (previous) {
        queryClient.setQueryData(entryKeys.detail(id), { ...previous, ...payload });
      }
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(entryKeys.detail(id), context.previous);
      }
      toast.error(getApiError(error));
    },
    onSuccess: (data) => {
      queryClient.setQueryData(entryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: entryKeys.all });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteEntryApi(id);
      return id;
    },
    onError: (error) => toast.error(getApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.all });
    },
  });
}
