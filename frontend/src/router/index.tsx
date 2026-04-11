import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { createBrowserRouter, NavLink, Outlet } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary.js";
import { PageSkeleton } from "../components/PageSkeleton.js";
import { ProtectedRoute } from "../components/ProtectedRoute.js";
import { useLogout } from "../features/auth/useAuth.js";
import { useAuthStore } from "../lib/store/auth.store.js";

const LoginPage = lazy(async () => import("../features/auth/LoginPage.js").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(async () => import("../features/auth/RegisterPage.js").then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(async () => import("../features/app/DashboardPage.js").then((m) => ({ default: m.DashboardPage })));
const EntriesPage = lazy(async () => import("../features/entries/EntriesPage.js").then((m) => ({ default: m.EntriesPage })));
const EntryDetailPage = lazy(async () => import("../features/entries/EntryDetailPage.js").then((m) => ({ default: m.EntryDetailPage })));
const MediaPage = lazy(async () => import("../features/media/MediaPage.js").then((m) => ({ default: m.MediaPage })));
const ContentTypesPage = lazy(async () => import("../features/content-types/ContentTypesPage.js").then((m) => ({ default: m.ContentTypesPage })));
const AnalyticsDashboard = lazy(async () => import("../features/analytics/AnalyticsDashboard.js").then((m) => ({ default: m.AnalyticsDashboard })));
const SettingsPage = lazy(async () => import("../features/settings/SettingsPage.js").then((m) => ({ default: m.SettingsPage })));
const UsersPage = lazy(async () => import("../features/users/UsersPage.js").then((m) => ({ default: m.UsersPage })));
const ConnectPage = lazy(async () => import("../features/connect/ConnectPage.js").then((m) => ({ default: m.ConnectPage })));
const UnauthorizedPage = lazy(async () => import("../features/app/UnauthorizedPage.js").then((m) => ({ default: m.UnauthorizedPage })));

function Shell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "⬡", section: "main", exact: true },
  { to: "/entries", label: "Content", icon: "✦", section: "main" },
  { to: "/media", label: "Media", icon: "◈", section: "main" },
  { to: "/connect", label: "Connect Website", icon: "⟳", section: "main" },
  { to: "/content-types", label: "Content Types", icon: "⊞", section: "manage", roles: ["admin", "editor"] as const },
  { to: "/analytics", label: "Analytics", icon: "◎", section: "manage", roles: ["admin"] as const },
  { to: "/users", label: "Users", icon: "⊕", section: "manage", roles: ["admin"] as const },
  { to: "/settings", label: "Settings", icon: "◉", section: "manage", roles: ["admin"] as const },
] as const;

function AppLayout() {
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!("roles" in item) || !item.roles) return true;
    return (item.roles as readonly ("admin" | "editor" | "viewer")[]).includes(user?.role as "admin" | "editor" | "viewer");
  });

  const mainItems = visibleItems.filter((i) => i.section === "main");
  const manageItems = visibleItems.filter((i) => i.section === "manage");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <div className="sidebar-logo-text">
            Simple<span>Stack</span>
          </div>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        )}

        <nav>
          {mainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"exact" in item && item.exact}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {manageItems.length > 0 && (
            <>
              <div className="sidebar-section-label">Manage</div>
              {manageItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-link btn-ghost"
            style={{ width: "100%", border: "none", cursor: "pointer", background: "none" }}
            onClick={() => logout.mutate()}
          >
            <span className="nav-link-icon">→</span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <Shell><LoginPage /></Shell> },
  { path: "/register", element: <Shell><RegisterPage /></Shell> },
  { path: "/unauthorized", element: <Shell><UnauthorizedPage /></Shell> },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Shell><DashboardPage /></Shell> },
      { path: "entries", element: <Shell><EntriesPage /></Shell> },
      { path: "entries/:id", element: <Shell><EntryDetailPage /></Shell> },
      { path: "media", element: <Shell><MediaPage /></Shell> },
      { path: "connect", element: <Shell><ConnectPage /></Shell> },
      { path: "content-types", element: <ProtectedRoute allowedRoles={["admin", "editor"]}><Shell><ContentTypesPage /></Shell></ProtectedRoute> },
      { path: "analytics", element: <ProtectedRoute allowedRoles={["admin"]}><Shell><AnalyticsDashboard /></Shell></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute allowedRoles={["admin"]}><Shell><SettingsPage /></Shell></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute allowedRoles={["admin"]}><Shell><UsersPage /></Shell></ProtectedRoute> },
    ],
  },
]);
