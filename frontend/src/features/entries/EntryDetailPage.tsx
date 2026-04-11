import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteEntry, useEntry, useUpdateEntry } from "./useEntries.js";

function statusBadge(status: string) {
  if (status === "published") return <span className="badge badge-green">● Published</span>;
  if (status === "archived") return <span className="badge badge-gray">● Archived</span>;
  return <span className="badge badge-yellow">● Draft</span>;
}

export function EntryDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useEntry(id);
  const update = useUpdateEntry(id);
  const deleteEntry = useDeleteEntry();

  const entry = query.data;
  const [status, setStatus] = useState<string | null>(null);
  const [editField, setEditField] = useState<{ key: string; value: string } | null>(null);
  const [fields, setFields] = useState<Record<string, unknown>>({});

  if (query.isPending) return <div className="muted" style={{ padding: 32 }}>Loading…</div>;
  if (!entry) return <div className="muted" style={{ padding: 32 }}>Entry not found.</div>;

  const entryFields = typeof entry.fields === "object" && entry.fields ? entry.fields as Record<string, unknown> : {};
  const currentFields = { ...entryFields, ...fields };

  async function saveStatus(newStatus: string) {
    setStatus(newStatus);
    await update.mutateAsync({ status: newStatus as "draft" | "published" | "archived" });
    toast.success("Status updated");
    setStatus(null);
  }

  async function saveField() {
    if (!editField) return;
    const updated = { ...currentFields, [editField.key]: editField.value };
    setFields(updated);
    await update.mutateAsync({ fields: updated });
    toast.success("Field saved");
    setEditField(null);
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/entries")} style={{ marginBottom: 8 }}>← Back</button>
          <div className="page-title">{entry.title}</div>
          <div className="row" style={{ marginTop: 6 }}>
            {statusBadge(String(status ?? entry.status ?? "draft"))}
            {"slug" in entry && entry.slug ? <span className="code-chip">{String(entry.slug)}</span> : null}
          </div>
        </div>
        <div className="row">
          <select
            className="field-input"
            style={{ width: "auto" }}
            value={String(status ?? entry.status ?? "draft")}
            onChange={(e) => void saveStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!confirm("Delete this entry permanently?")) return;
              await deleteEntry.mutateAsync(id);
              navigate("/entries");
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="panel stack">
        <div className="section-title">Content Fields</div>
        {Object.keys(currentFields).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-desc">No custom fields on this entry yet.</div>
          </div>
        ) : (
          <div className="stack-sm">
            {Object.entries(currentFields).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 140, fontWeight: 600, fontSize: 13, color: "var(--text-2)", paddingTop: 2, flexShrink: 0 }}>{key}</div>
                {editField?.key === key ? (
                  <div className="row" style={{ flex: 1 }}>
                    <input
                      className="field-input"
                      style={{ flex: 1 }}
                      value={editField.value}
                      onChange={(e) => setEditField({ key, value: e.target.value })}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => void saveField()}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditField(null)}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 14 }}>{String(val ?? "—")}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditField({ key, value: String(val ?? "") })}>Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
