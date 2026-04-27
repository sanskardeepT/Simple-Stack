import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "../../components/ui/Pagination.js";
import { useContentTypes } from "../content-types/useContentTypes.js";
import { useCreateEntry, useDeleteEntry, useEntries } from "./useEntries.js";

function statusBadge(status: string) {
  if (status === "published") return <span className="badge badge-green">● Published</span>;
  if (status === "archived") return <span className="badge badge-gray">● Archived</span>;
  return <span className="badge badge-yellow">● Draft</span>;
}

export function EntriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContentTypeId, setNewContentTypeId] = useState("");
  const [newStatus, setNewStatus] = useState<"draft" | "published">("draft");
  const [newFields, setNewFields] = useState<Record<string, unknown>>({});

  const query = useEntries({ page, search: search || undefined });
  const ctQuery = useContentTypes({ limit: 100 });
  const createEntry = useCreateEntry();
  const deleteEntry = useDeleteEntry();
  const navigate = useNavigate();

  const entries = (query.data?.data ?? []) as Array<Record<string, unknown>>;
  const contentTypes = (ctQuery.data?.data ?? []) as Array<Record<string, unknown>>;
  const selectedType = contentTypes.find((type) => String(type._id) === newContentTypeId);
  const selectedFields = Array.isArray(selectedType?.fields) ? selectedType.fields as Array<{ name: string; type: string; required?: boolean; options?: string[] }> : [];

  async function handleCreate() {
    if (!newTitle || !newContentTypeId) return;
    await createEntry.mutateAsync({ title: newTitle, contentTypeId: newContentTypeId, fields: newFields, status: newStatus } as never);
    setShowCreate(false);
    setNewTitle("");
    setNewContentTypeId("");
    setNewStatus("draft");
    setNewFields({});
  }

  function updateNewField(name: string, value: unknown) {
    setNewFields((current) => ({ ...current, [name]: value }));
  }

  function renderFieldInput(field: { name: string; type: string; required?: boolean; options?: string[] }) {
    const value = newFields[field.name] ?? "";
    if (field.type === "richText") {
      return <textarea className="field-input" value={String(value)} onChange={(e) => updateNewField(field.name, e.target.value)} />;
    }
    if (field.type === "number") {
      return <input className="field-input" type="number" value={String(value)} onChange={(e) => updateNewField(field.name, Number(e.target.value))} />;
    }
    if (field.type === "boolean") {
      return (
        <select className="field-input" value={String(value)} onChange={(e) => updateNewField(field.name, e.target.value === "true")}>
          <option value="">Choose...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    if (field.type === "date") {
      return <input className="field-input" type="date" value={String(value)} onChange={(e) => updateNewField(field.name, e.target.value)} />;
    }
    if (field.type === "select") {
      return (
        <select className="field-input" value={String(value)} onChange={(e) => updateNewField(field.name, e.target.value)}>
          <option value="">Choose...</option>
          {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    return <input className="field-input" placeholder={field.type === "image" ? "Paste image URL from Media" : ""} value={String(value)} onChange={(e) => updateNewField(field.name, e.target.value)} />;
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Your items</div>
          <div className="page-subtitle">Add, edit, and publish website content without touching code.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Entry</button>
      </div>

      <div className="panel stack">
        <div className="row">
          <input
            className="field-input"
            placeholder="🔍  Search content…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ maxWidth: 300 }}
          />
          <span className="muted text-sm">{query.data?.meta?.total ?? 0} entries</span>
        </div>

        {entries.length === 0 && !query.isPending ? (
          <div className="empty-state">
            <div className="empty-state-icon">✦</div>
            <div className="empty-state-title">No content yet</div>
            <div className="empty-state-desc">Click &quot;New Entry&quot; to create your first piece of content.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr key={String(row._id)}>
                    <td style={{ fontWeight: 500 }}>
                      <button
                        onClick={() => navigate(`/entries/${String(row._id)}`)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontWeight: 500, fontSize: 14, padding: 0, textAlign: "left" }}
                      >
                        {String(row.title ?? "—")}
                      </button>
                    </td>
                    <td>{statusBadge(String(row.status ?? "draft"))}</td>
                    <td className="muted text-sm">{row.updatedAt ? new Date(String(row.updatedAt)).toLocaleDateString() : "—"}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => { if (confirm("Delete this entry?")) deleteEntry.mutate(String(row._id)); }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={query.data?.meta} onPageChange={setPage} />
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal stack">
            <div className="modal-header">
              <div className="modal-title">New Content Entry</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="field">
              <label className="field-label">Title</label>
              <input className="field-input" placeholder="e.g. My First Blog Post" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">What kind of content?</label>
              <select className="field-input" value={newContentTypeId} onChange={(e) => setNewContentTypeId(e.target.value)}>
                <option value="">Select a content type…</option>
                {contentTypes.map((ct) => (
                  <option key={String(ct._id)} value={String(ct._id)}>{String(ct.name)}</option>
                ))}
              </select>
              {(ctQuery.data?.data ?? []).length === 0 && (
                <span className="field-hint">No content types yet. <Link to="/app/content-types" style={{ color: "var(--accent)" }}>Create one first.</Link></span>
              )}
            </div>
            {selectedFields.length > 0 && (
              <div className="stack-sm">
                <div className="section-title">Content details</div>
                {selectedFields.map((field) => (
                  <div className="field" key={field.name}>
                    <label className="field-label">{field.name}{field.required ? " *" : ""}</label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            )}
            <div className="field">
              <label className="field-label">Status</label>
              <select className="field-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value as "draft" | "published")}>
                <option value="draft">Draft — save privately</option>
                <option value="published">Published — visible on website</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => void handleCreate()} disabled={createEntry.isPending || !newTitle || !newContentTypeId}>
                {createEntry.isPending ? "Creating…" : "Create Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
