import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useContentTypes } from "../content-types/useContentTypes.js";
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
  const contentTypes = useContentTypes({ limit: 100 });
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
  const contentType = ((contentTypes.data?.data ?? []) as Array<Record<string, unknown>>).find((type) => String(type._id) === String(entry.contentTypeId));
  const schemaFields = Array.isArray(contentType?.fields) ? contentType.fields as Array<{ name: string; type: string; required?: boolean; options?: string[] }> : [];

  async function saveStatus(newStatus: string) {
    setStatus(newStatus);
    await update.mutateAsync({ status: newStatus as "draft" | "published" | "archived" });
    toast.success("Status updated");
    setStatus(null);
  }

  async function saveField() {
    if (!editField) return;
    const definition = schemaFields.find((field) => field.name === editField.key);
    const nextValue =
      definition?.type === "number" ? Number(editField.value) :
      definition?.type === "boolean" ? editField.value === "true" :
      editField.value;
    const updated = { ...currentFields, [editField.key]: nextValue };
    setFields(updated);
    await update.mutateAsync({ fields: updated });
    toast.success("Field saved");
    setEditField(null);
  }

  function fieldInput(key: string, type: string, value: unknown, options?: readonly string[]) {
    const stringValue = String(value ?? "");
    if (type === "richText") {
      return <textarea className="field-input" value={editField?.value ?? stringValue} onChange={(e) => setEditField({ key, value: e.target.value })} />;
    }
    if (type === "number") {
      return <input className="field-input" type="number" value={editField?.value ?? stringValue} onChange={(e) => setEditField({ key, value: e.target.value })} />;
    }
    if (type === "boolean") {
      return (
        <select className="field-input" value={editField?.value ?? stringValue} onChange={(e) => setEditField({ key, value: e.target.value })}>
          <option value="">Choose...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    if (type === "date") {
      return <input className="field-input" type="date" value={editField?.value ?? stringValue} onChange={(e) => setEditField({ key, value: e.target.value })} />;
    }
    if (type === "select") {
      return (
        <select className="field-input" value={editField?.value ?? stringValue} onChange={(e) => setEditField({ key, value: e.target.value })}>
          <option value="">Choose...</option>
          {(options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    return <input className="field-input" value={editField?.value ?? stringValue} onChange={(e) => setEditField({ key, value: e.target.value })} />;
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/app/entries")} style={{ marginBottom: 8 }}>← Back</button>
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
              navigate("/app/entries");
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="panel stack">
        <div className="section-title">Content Fields</div>
        {(schemaFields.length === 0 && Object.keys(currentFields).length === 0) ? (
          <div className="empty-state">
            <div className="empty-state-desc">No custom fields on this entry yet.</div>
          </div>
        ) : (
          <div className="stack-sm">
            {(schemaFields.length > 0 ? schemaFields.map((field) => [field.name, currentFields[field.name], field] as const) : Object.entries(currentFields).map(([key, val]) => [key, val, { name: key, type: "text", required: false, options: [] }] as const)).map(([key, val, definition]) => (
              <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 140, fontWeight: 600, fontSize: 13, color: "var(--text-2)", paddingTop: 2, flexShrink: 0 }}>{key}{definition.required ? " *" : ""}</div>
                {editField?.key === key ? (
                  <div className="row" style={{ flex: 1 }}>
                    <div style={{ flex: 1 }}>{fieldInput(key, definition.type, val, definition.options)}</div>
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
