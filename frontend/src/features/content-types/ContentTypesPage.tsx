import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/api/client.js";
import { contentTypeKeys, useContentTypes } from "./useContentTypes.js";

const FIELD_TYPES = ["text", "richText", "number", "boolean", "image", "date", "select"] as const;

const FIELD_LABELS: Record<typeof FIELD_TYPES[number], string> = {
  text: "Short text",
  richText: "Long text",
  number: "Number",
  boolean: "Yes / No",
  image: "Image",
  date: "Date",
  select: "Dropdown",
};

export function ContentTypesPage() {
  const [page] = useState(1);
  const query = useContentTypes({ page });
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [fields, setFields] = useState([{ name: "", type: "text" as typeof FIELD_TYPES[number], required: false, options: "" }]);
  const [saving, setSaving] = useState(false);

  const types = (query.data?.data ?? []) as Array<Record<string, unknown>>;

  function addField() { setFields((f) => [...f, { name: "", type: "text", required: false, options: "" }]); }
  function removeField(i: number) { setFields((f) => f.filter((_, idx) => idx !== i)); }
  function updateField(i: number, key: string, value: unknown) {
    setFields((f) => f.map((field, idx) => idx === i ? { ...field, [key]: value } : field));
  }

  async function handleCreate() {
    if (!name || fields.some((f) => !f.name)) { toast.error("Fill in all field names"); return; }
    setSaving(true);
    try {
    await api.post("/content-types", {
      name,
      description: desc,
      fields: fields.map((field) => ({
        name: field.name,
        type: field.type,
        required: field.required,
        ...(field.type === "select" ? { options: field.options.split(",").map((item) => item.trim()).filter(Boolean) } : {}),
      })),
    });
      qc.invalidateQueries({ queryKey: contentTypeKeys.all });
      setShowCreate(false);
      setName("");
      setDesc("");
      setFields([{ name: "", type: "text", required: false, options: "" }]);
      toast.success("Content type created!");
    } catch {
      toast.error("Failed to create. Try again.");
    } finally { setSaving(false); }
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">What kind of content?</div>
          <div className="page-subtitle">Create reusable shapes like Menu Items, Blog Posts, Products, or FAQs.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Type</button>
      </div>

      {types.length === 0 && !query.isPending ? (
        <div className="empty-state">
          <div className="empty-state-icon">⊞</div>
          <div className="empty-state-title">No content structure yet</div>
          <div className="empty-state-desc">Start with a shape like Menu Item: title, price, description, image, category.</div>
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
                    <span key={f.name} className="code-chip">{f.name}: {FIELD_LABELS[f.type as typeof FIELD_TYPES[number]] ?? f.type}</span>
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
              <div className="modal-title">New content structure</div>
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
                    <select className="field-input" style={{ width: 140 }} value={field.type} onChange={(e) => updateField(i, "type", e.target.value)}>
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_LABELS[t]}</option>)}
                    </select>
                    <label className="row" style={{ gap: 4, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, "required", e.target.checked)} />
                      Required
                    </label>
                    {fields.length > 1 && (
                      <button className="btn btn-ghost btn-icon" onClick={() => removeField(i)}>✕</button>
                    )}
                    {field.type === "select" && (
                      <input
                        className="field-input"
                        style={{ flexBasis: "100%" }}
                        placeholder="Dropdown choices, comma separated: Starters, Main Course, Drinks"
                        value={field.options}
                        onChange={(e) => updateField(i, "options", e.target.value)}
                      />
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
