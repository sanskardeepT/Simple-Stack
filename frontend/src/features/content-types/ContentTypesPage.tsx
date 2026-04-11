import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/api/client.js";
import { contentTypeKeys, useContentTypes } from "./useContentTypes.js";

const FIELD_TYPES = ["text", "richtext", "number", "boolean", "date", "media", "relation", "json"] as const;

export function ContentTypesPage() {
  const [page] = useState(1);
  const query = useContentTypes({ page });
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [fields, setFields] = useState([{ name: "", type: "text" as typeof FIELD_TYPES[number], required: false }]);
  const [saving, setSaving] = useState(false);

  const types = (query.data?.data ?? []) as Array<Record<string, unknown>>;

  function addField() { setFields((f) => [...f, { name: "", type: "text", required: false }]); }
  function removeField(i: number) { setFields((f) => f.filter((_, idx) => idx !== i)); }
  function updateField(i: number, key: string, value: unknown) {
    setFields((f) => f.map((field, idx) => idx === i ? { ...field, [key]: value } : field));
  }

  async function handleCreate() {
    if (!name || fields.some((f) => !f.name)) { toast.error("Fill in all field names"); return; }
    setSaving(true);
    try {
      await api.post("/content-types", { name, description: desc, fields });
      qc.invalidateQueries({ queryKey: contentTypeKeys.all });
      setShowCreate(false);
      setName("");
      setDesc("");
      setFields([{ name: "", type: "text", required: false }]);
      toast.success("Content type created!");
    } catch {
      toast.error("Failed to create. Try again.");
    } finally { setSaving(false); }
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Content Types</div>
          <div className="page-subtitle">Define the structure of your content — like &quot;Blog Post&quot; or &quot;Product&quot;.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Type</button>
      </div>

      {types.length === 0 && !query.isPending ? (
        <div className="empty-state">
          <div className="empty-state-icon">⊞</div>
          <div className="empty-state-title">No content types yet</div>
          <div className="empty-state-desc">A content type defines what fields your content has. E.g. a &quot;Blog Post&quot; has a Title, Body, and Image.</div>
        </div>
      ) : (
        <div className="grid-2">
          {types.map((ct) => {
            const fieldList = Array.isArray(ct.fields) ? ct.fields as Array<{ name: string; type: string }> : [];
            return (
              <div key={String(ct._id)} className="panel stack-sm">
                <div style={{ fontWeight: 700, fontSize: 16 }}>{String(ct.name)}</div>
                {typeof ct.description === "string" && ct.description && <div className="muted text-sm">{ct.description}</div>}
                <div className="row" style={{ flexWrap: "wrap", marginTop: 4 }}>
                  {fieldList.map((f) => (
                    <span key={f.name} className="code-chip">{f.name}: {f.type}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal stack">
            <div className="modal-header">
              <div className="modal-title">New Content Type</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="field">
              <label className="field-label">Name (e.g. Blog Post, Product, FAQ)</label>
              <input className="field-input" placeholder="Blog Post" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Description (optional)</label>
              <input className="field-input" placeholder="What is this content type for?" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: 8 }}>Fields</div>
              <div className="stack-sm">
                {fields.map((field, i) => (
                  <div key={i} className="row">
                    <input className="field-input" style={{ flex: 1 }} placeholder="Field name (e.g. title)" value={field.name} onChange={(e) => updateField(i, "name", e.target.value)} />
                    <select className="field-input" style={{ width: 120 }} value={field.type} onChange={(e) => updateField(i, "type", e.target.value)}>
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="row" style={{ gap: 4, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, "required", e.target.checked)} />
                      Required
                    </label>
                    {fields.length > 1 && (
                      <button className="btn btn-ghost btn-icon" onClick={() => removeField(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={addField} style={{ alignSelf: "flex-start" }}>+ Add field</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => void handleCreate()} disabled={saving}>
                {saving ? "Saving…" : "Create Content Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
