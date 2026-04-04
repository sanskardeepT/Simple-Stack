import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { changePasswordApi, loginApi, logoutApi, meApi, registerApi } from "../../lib/api/auth.api.js";
import { authStore, useAuthStore } from "../../lib/store/auth.store.js";

export function useBootstrapAuth() {
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuth = useAuthStore((state) => state.setAuth);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await meApi();
      return response.data.data as { _id: string; name: string; email: string; role: "admin" | "editor" | "viewer" };
    },
    retry: false,
  });

  useEffect(() => {
    if (query.isPending) {
      setLoading(true);
    } else if (query.isError) {
      clearAuth();
    } else if (query.isSuccess) {
      const currentToken = authStore.getState().accessToken;
      if (currentToken) {
        setAuth(query.data, currentToken);
      } else {
        setLoading(false);
      }
    }
  }, [clearAuth, query.data, query.isError, query.isPending, query.isSuccess, setAuth, setLoading]);

  return query;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await loginApi(payload);
      return response.data.data as { user: { _id: string; name: string; email: string; role: "admin" | "editor" | "viewer" }; accessToken: string };
    },
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const response = await registerApi(payload);
      return response.data.data as { user: { _id: string; name: string; email: string; role: "admin" | "editor" | "viewer" }; accessToken: string };
    },
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  return useMutation({
    mutationFn: async () => {
      await logoutApi();
    },
    onSuccess: () => clearAuth(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const response = await changePasswordApi(payload);
      return response.data.data as { success: true };
    },
  });
}
