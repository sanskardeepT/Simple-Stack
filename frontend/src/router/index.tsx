import type { ReactNode } from "react";
import { Suspense, lazy, useState } from "react";
import { createBrowserRouter, NavLink, Outlet } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary.js";
import { PageSkeleton } from "../components/PageSkeleton.js";
import { ProtectedRoute } from "../components/ProtectedRoute.js";
import { useLogout } from "../features/auth/useAuth.js";
import { useAuthStore } from "../lib/store/auth.store.js";

const LoginPage = lazy(async () => import("../features/auth/LoginPage.js").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(async () => import("../features/auth/RegisterPage.js").then((m) => ({ default: m.RegisterPage })));
const VerifyOtpPage = lazy(async () => import("../features/auth/VerifyOtpPage.js").then((m) => ({ default: m.VerifyOtpPage })));
const DashboardPage = lazy(async () => import("../features/app/DashboardPage.js").then((m) => ({ default: m.DashboardPage })));
const EntriesPage = lazy(async () => import("../features/entries/EntriesPage.js").then((m) => ({ default: m.EntriesPage })));
const EntryDetailPage = lazy(async () => import("../features/entries/EntryDetailPage.js").then((m) => ({ default: m.EntryDetailPage })));
const MediaPage = lazy(async () => import("../features/media/MediaPage.js").then((m) => ({ default: m.MediaPage })));
const ContentTypesPage = lazy(async () => import("../features/content-types/ContentTypesPage.js").then((m) => ({ default: m.ContentTypesPage })));
const AnalyticsDashboard = lazy(async () => import("../features/analytics/AnalyticsDashboard.js").then((m) => ({ default: m.AnalyticsDashboard })));
const SettingsPage = lazy(async () => import("../features/settings/SettingsPage.js").then((m) => ({ default: m.SettingsPage })));
const UsersPage = lazy(async () => import("../features/users/UsersPage.js").then((m) => ({ default: m.UsersPage })));
const ConnectPage = lazy(async () => import("../features/connect/ConnectPage.js").then((m) => ({ default: m.ConnectPage })));
const SubscriptionPage = lazy(async () => import("../features/subscription/SubscriptionPage.js").then((m) => ({ default: m.SubscriptionPage })));
const UnauthorizedPage = lazy(async () => import("../features/app/UnauthorizedPage.js").then((m) => ({ default: m.UnauthorizedPage })));
const NotFoundPage = lazy(async () => import("../features/app/NotFoundPage.js").then((m) => ({ default: m.NotFoundPage })));
const MarketingHomePage = lazy(async () => import("../features/marketing/MarketingHomePage.js").then((m) => ({ default: m.MarketingHomePage })));
const PricingPage = lazy(async () => import("../features/marketing/PricingPage.js").then((m) => ({ default: m.PricingPage })));
const BlogPage = lazy(async () => import("../features/marketing/BlogPage.js").then((m) => ({ default: m.BlogPage })));
const OnboardingTour = lazy(async () => import("../features/app/OnboardingTour.js").then((m) => ({ default: m.OnboardingTour })));

function Shell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: "⬡", section: "main", exact: true },
  { to: "/app/entries", label: "Content", icon: "✦", section: "main" },
  { to: "/app/media", label: "Media", icon: "◈", section: "main" },
  { to: "/app/connect", label: "Connect Website", icon: "⟳", section: "main" },
  { to: "/app/billing", label: "Billing", icon: "₹", section: "main" },
  { to: "/app/content-types", label: "What kind of content?", icon: "⊞", section: "manage" },
  { to: "/app/analytics", label: "Activity", icon: "◎", section: "manage", roles: ["superadmin"] as const },
  { to: "/app/users", label: "Users", icon: "⊕", section: "manage", roles: ["superadmin"] as const },
  { to: "/app/settings", label: "Settings", icon: "◉", section: "manage", roles: ["superadmin"] as const },
] as const;

function AppLayout() {
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem("simplestack:onboarding-dismissed");
  });

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!("roles" in item) || !item.roles) return true;
    return (item.roles as readonly ("superadmin" | "user")[]).includes(user?.role as "superadmin" | "user");
  });

  const mainItems = visibleItems.filter((i) => i.section === "main");
  const manageItems = visibleItems.filter((i) => i.section === "manage");

  return (
    <div className="app-shell">
      {showOnboarding && <Shell><OnboardingTour onClose={() => { window.localStorage.setItem("simplestack:onboarding-dismissed", "1"); setShowOnboarding(false); }} /></Shell>}
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
  { path: "/", element: <Shell><MarketingHomePage /></Shell> },
  { path: "/pricing", element: <Shell><PricingPage /></Shell> },
  { path: "/blog", element: <Shell><BlogPage /></Shell> },
  { path: "/login", element: <Shell><LoginPage /></Shell> },
  { path: "/register", element: <Shell><RegisterPage /></Shell> },
  { path: "/verify", element: <Shell><VerifyOtpPage /></Shell> },
  { path: "/unauthorized", element: <Shell><UnauthorizedPage /></Shell> },
  { path: "*", element: <Shell><NotFoundPage /></Shell> },
  {
    path: "/app",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Shell><DashboardPage /></Shell> },
      { path: "entries", element: <Shell><EntriesPage /></Shell> },
      { path: "entries/:id", element: <Shell><EntryDetailPage /></Shell> },
      { path: "media", element: <Shell><MediaPage /></Shell> },
      { path: "connect", element: <Shell><ConnectPage /></Shell> },
      { path: "billing", element: <Shell><SubscriptionPage /></Shell> },
      { path: "content-types", element: <Shell><ContentTypesPage /></Shell> },
      { path: "analytics", element: <ProtectedRoute allowedRoles={["superadmin"]}><Shell><AnalyticsDashboard /></Shell></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute allowedRoles={["superadmin"]}><Shell><SettingsPage /></Shell></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute allowedRoles={["superadmin"]}><Shell><UsersPage /></Shell></ProtectedRoute> },
    ],
  },
]);
