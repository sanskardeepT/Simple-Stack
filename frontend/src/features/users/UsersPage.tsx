import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/api/client.js";

type User = { _id: string; name: string; email: string; role: string; isActive: boolean; lastLogin?: string };

export function UsersPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const r = await api.get("/users");
      return r.data.data as User[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      await api.patch(`/users/${id}`, payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User updated"); },
    onError: () => toast.error("Update failed"),
  });

  const users = query.data ?? [];

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Team Members</div>
          <div className="page-subtitle">Manage who can access and edit your CMS.</div>
        </div>
      </div>

      {users.length === 0 && !query.isPending ? (
        <div className="empty-state">
          <div className="empty-state-icon">⊕</div>
          <div className="empty-state-title">No users found</div>
        </div>
      ) : (
        <div className="panel stack-sm" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td className="muted font-mono text-sm">{u.email}</td>
                    <td>
                      <select
                        className="field-input"
                        style={{ width: "auto", padding: "4px 8px", fontSize: 13 }}
                        value={u.role}
                        onChange={(e) => update.mutate({ id: u._id, payload: { role: e.target.value } })}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>
                        {u.isActive ? "● Active" : "● Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-secondary"}`}
                        onClick={() => update.mutate({ id: u._id, payload: { isActive: !u.isActive } })}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
