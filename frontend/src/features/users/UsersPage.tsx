import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { getApiError, api } from "../../lib/api/client.js";

type Subscription = {
  status: "inactive" | "active" | "expired" | "cancelled";
  plan: "none" | "paid" | "coupon" | "free_trial";
  expiry: string | null;
  coupon: string;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "superadmin" | "user";
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  subscription?: Subscription;
  lastLogin?: string;
  createdAt?: string;
  counts?: {
    contentTypes: number;
    entries: number;
    media: number;
    totalSites: number;
  };
};

type Dashboard = {
  totalUsers: number;
  activeSubscribers: number;
  couponUsers: number;
  paidUsers: number;
  mrr: number;
  totalSitesConnected: number;
};

type PaginatedUsers = {
  data: AdminUser[];
  meta?: { page: number; totalPages: number; total: number };
};

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [edit, setEdit] = useState({ name: "", email: "", phone: "" });

  const dashboard = useQuery({
    queryKey: ["users", "dashboard"],
    queryFn: async () => {
      const response = await api.get("/users/dashboard");
      return response.data.data as Dashboard;
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users", "list", search],
    queryFn: async () => {
      const response = await api.get("/users", { params: { search, limit: 50, sort: "createdAt", order: "desc" } });
      return response.data as PaginatedUsers;
    },
  });

  const refreshUsers = () => {
    void qc.invalidateQueries({ queryKey: ["users"] });
  };

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const response = await api.patch(`/users/${id}`, payload);
      return response.data.data as AdminUser;
    },
    onSuccess: (user) => {
      setSelected((current) => (current?._id === user._id ? { ...current, ...user } : current));
      refreshUsers();
      toast.success("User updated");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const activate = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: "paid" | "coupon" | "free_trial" }) => {
      const response = await api.post(`/users/${id}/subscription/activate`, { plan, months: 1 });
      return response.data.data as AdminUser;
    },
    onSuccess: (user) => {
      setSelected((current) => (current?._id === user._id ? { ...current, ...user } : current));
      refreshUsers();
      toast.success("Subscription activated");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/users/${id}/subscription/deactivate`, {});
      return response.data.data as AdminUser;
    },
    onSuccess: (user) => {
      setSelected((current) => (current?._id === user._id ? { ...current, ...user } : current));
      refreshUsers();
      toast.success("Subscription deactivated");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      setSelected(null);
      refreshUsers();
      toast.success("User deleted");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const users = usersQuery.data?.data ?? [];
  const stats = dashboard.data ?? { totalUsers: 0, activeSubscribers: 0, couponUsers: 0, paidUsers: 0, mrr: 0, totalSitesConnected: 0 };

  function openUser(user: AdminUser) {
    setSelected(user);
    setEdit({ name: user.name, email: user.email, phone: user.phone });
  }

  async function exportCsv() {
    const response = await api.get("/users/export.csv", { params: { search }, responseType: "blob" });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "simplestack-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Super Admin Panel</div>
          <div className="page-subtitle">Users, subscriptions, revenue, and account controls in one private place.</div>
        </div>
        <button className="btn btn-secondary" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="grid-4">
        <div className="stat-card"><div className="stat-label">Total users</div><div className="stat-value">{stats.totalUsers}</div></div>
        <div className="stat-card"><div className="stat-label">Active subscribers</div><div className="stat-value">{stats.activeSubscribers}</div></div>
        <div className="stat-card"><div className="stat-label">MRR</div><div className="stat-value">₹{stats.mrr}</div></div>
        <div className="stat-card"><div className="stat-label">Sites connected</div><div className="stat-value">{stats.totalSitesConnected}</div></div>
      </div>

      <div className="panel stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="section-title">All users</div>
            <div className="muted text-sm">{usersQuery.data?.meta?.total ?? users.length} accounts found</div>
          </div>
          <input
            className="field-input"
            style={{ maxWidth: 320 }}
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Subscription</th>
                <th>Last login</th>
                <th>Sites</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div className="muted text-xs">{user.role}</div>
                  </td>
                  <td>
                    <div className="font-mono text-sm">{user.email}</div>
                    <div className="muted text-xs">{user.phone}</div>
                  </td>
                  <td>
                    <span className={`badge ${user.subscription?.status === "active" ? "badge-green" : "badge-yellow"}`}>
                      {user.subscription?.status ?? "inactive"} · {user.subscription?.plan ?? "none"}
                    </span>
                  </td>
                  <td className="muted text-sm">{formatDate(user.lastLogin)}</td>
                  <td>{user.counts?.totalSites ?? 0}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openUser(user)}>View</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !usersQuery.isPending && (
                <tr><td colSpan={6} className="muted">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal user-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.name}</div>
                <div className="muted text-sm">{selected.email}</div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="stack">
              <div className="grid-2">
                <div className="stat-card"><div className="stat-label">Items</div><div className="stat-value">{selected.counts?.entries ?? 0}</div></div>
                <div className="stat-card"><div className="stat-label">Media</div><div className="stat-value">{selected.counts?.media ?? 0}</div></div>
              </div>

              <div className="panel stack-sm">
                <div className="section-title">Edit profile</div>
                <input className="field-input" value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value })} />
                <input className="field-input" value={edit.email} onChange={(event) => setEdit({ ...edit, email: event.target.value })} />
                <input className="field-input" value={edit.phone} onChange={(event) => setEdit({ ...edit, phone: event.target.value })} />
                <div className="row">
                  <button className="btn btn-primary btn-sm" onClick={() => update.mutate({ id: selected._id, payload: edit })}>Save changes</button>
                  <button
                    className={`btn btn-sm ${selected.isActive ? "btn-danger" : "btn-secondary"}`}
                    onClick={() => update.mutate({ id: selected._id, payload: { isActive: !selected.isActive } })}
                  >
                    {selected.isActive ? "Deactivate account" : "Activate account"}
                  </button>
                </div>
              </div>

              <div className="panel stack-sm">
                <div className="section-title">Subscription</div>
                <div className="row">
                  <span className={`badge ${selected.subscription?.status === "active" ? "badge-green" : "badge-red"}`}>
                    {selected.subscription?.status ?? "inactive"}
                  </span>
                  <span className="muted text-sm">{selected.subscription?.plan ?? "none"} · expires {formatDate(selected.subscription?.expiry)}</span>
                </div>
                <div className="row">
                  <button className="btn btn-secondary btn-sm" onClick={() => activate.mutate({ id: selected._id, plan: "paid" })}>Activate paid</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => activate.mutate({ id: selected._id, plan: "coupon" })}>Activate coupon</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deactivate.mutate(selected._id)}>Deactivate plan</button>
                </div>
              </div>

              <div className="panel stack-sm">
                <div className="section-title">Full profile</div>
                <div className="muted text-sm">Email verified: {selected.emailVerified ? "Yes" : "No"}</div>
                <div className="muted text-sm">Phone verified: {selected.phoneVerified ? "Yes" : "No"}</div>
                <div className="muted text-sm">Created: {formatDate(selected.createdAt)}</div>
                <div className="muted text-sm">Content structures: {selected.counts?.contentTypes ?? 0}</div>
                <button
                  className="btn btn-danger"
                  disabled={selected.role === "superadmin" || remove.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete ${selected.email}? This cannot be undone.`)) {
                      remove.mutate(selected._id);
                    }
                  }}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
