import { create } from "zustand";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,
  setAuth: (user, token) =>
    set({
      user,
      accessToken: token,
      isLoading: false,
      isAuthenticated: true,
    }),
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    }),
  setLoading: (value) => set({ isLoading: value }),
}));

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
};
