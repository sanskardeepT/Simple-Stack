import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { createBrowserRouter, NavLink, Outlet } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary.js";
import { PageSkeleton } from "../components/PageSkeleton.js";
import { ProtectedRoute } from "../components/ProtectedRoute.js";
import { Button } from "../components/ui/Button.js";
import { useLogout } from "../features/auth/useAuth.js";
import { useAuthStore } from "../lib/store/auth.store.js";

const LoginPage = lazy(async () => import("../features/auth/LoginPage.js").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(async () => import("../features/auth/RegisterPage.js").then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(async () => import("../features/app/DashboardPage.js").then((module) => ({ default: module.DashboardPage })));
const EntriesPage = lazy(async () => import("../features/entries/EntriesPage.js").then((module) => ({ default: module.EntriesPage })));
const EntryDetailPage = lazy(async () => import("../features/entries/EntryDetailPage.js").then((module) => ({ default: module.EntryDetailPage })));
const MediaPage = lazy(async () => import("../features/media/MediaPage.js").then((module) => ({ default: module.MediaPage })));
const ContentTypesPage = lazy(async () =>
  import("../features/content-types/ContentTypesPage.js").then((module) => ({ default: module.ContentTypesPage })),
);
const AnalyticsDashboard = lazy(async () =>
  import("../features/analytics/AnalyticsDashboard.js").then((module) => ({ default: module.AnalyticsDashboard })),
);
const SettingsPage = lazy(async () => import("../features/settings/SettingsPage.js").then((module) => ({ default: module.SettingsPage })));
const UsersPage = lazy(async () => import("../features/users/UsersPage.js").then((module) => ({ default: module.UsersPage })));
const UnauthorizedPage = lazy(async () =>
  import("../features/app/UnauthorizedPage.js").then((module) => ({ default: module.UnauthorizedPage })),
);

function RouteShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function AppLayout() {
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="app-shell">
      <div className="layout">
        <aside className="sidebar">
          <h2>Simple Stack</h2>
          <p className="muted">{user ? `${user.name} (${user.role})` : "CMS workspace"}</p>
          <nav>
            <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/">
              Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/entries">
              Entries
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/media">
              Media
            </NavLink>
            {(user?.role === "admin" || user?.role === "editor") && (
              <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/content-types">
                Content Types
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/analytics">
                Analytics
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/users">
                Users
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/settings">
                Settings
              </NavLink>
            )}
          </nav>
          <Button style={{ marginTop: 16, width: "100%" }} variant="secondary" onClick={() => logout.mutate()}>
            Sign out
          </Button>
        </aside>
        <main className="stack">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RouteShell>
        <LoginPage />
      </RouteShell>
    ),
  },
  {
    path: "/register",
    element: (
      <RouteShell>
        <RegisterPage />
      </RouteShell>
    ),
  },
  {
    path: "/unauthorized",
    element: (
      <RouteShell>
        <UnauthorizedPage />
      </RouteShell>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteShell>
            <DashboardPage />
          </RouteShell>
        ),
      },
      {
        path: "entries",
        element: (
          <RouteShell>
            <EntriesPage />
          </RouteShell>
        ),
      },
      {
        path: "entries/:id",
        element: (
          <RouteShell>
            <EntryDetailPage />
          </RouteShell>
        ),
      },
      {
        path: "media",
        element: (
          <RouteShell>
            <MediaPage />
          </RouteShell>
        ),
      },
      {
        path: "content-types",
        element: (
          <ProtectedRoute allowedRoles={["admin", "editor"]}>
            <RouteShell>
              <ContentTypesPage />
            </RouteShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <RouteShell>
              <AnalyticsDashboard />
            </RouteShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <RouteShell>
              <SettingsPage />
            </RouteShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <RouteShell>
              <UsersPage />
            </RouteShell>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
