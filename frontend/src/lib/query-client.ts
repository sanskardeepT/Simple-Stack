import { QueryCache, QueryClient } from "@tanstack/react-query";
import { authStore } from "./store/auth.store.js";

function redirectToLogin(): void {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof Error && error.message.toLowerCase().includes("401")) {
        authStore.getState().clearAuth();
        redirectToLogin();
      }
    },
  }),
});
