import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../../components/ui/Pagination.js";
import { useCreateMedia, useDeleteMedia, useMedia } from "./useMedia.js";

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return null;
  return "◈";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaPage() {
  const [page, setPage] = useState(1);
  const query = useMedia({ page });
  const upload = useCreateMedia();
  const remove = useDeleteMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const files = (query.data?.data ?? []) as Array<Record<string, unknown>>;

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      const fd = new FormData();
      fd.append("file", file);
      upload.mutate(fd);
    });
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Media Library</div>
          <div className="page-subtitle">Images you can use in your content. Upload once, reuse anywhere.</div>
        </div>
        <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>+ Upload File</button>
      </div>

      <div
        className="panel"
        style={{
          border: dragging ? "2px dashed var(--accent)" : "2px dashed var(--border)",
          background: dragging ? "var(--accent-glow)" : "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>◈</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop files here or click to upload</div>
        <div className="muted text-sm">JPG, PNG, WebP, and GIF images up to 10MB. Cloudinary is used when configured.</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {upload.isPending && (
        <div className="alert alert-success">Uploading…</div>
      )}

      {files.length === 0 && !query.isPending ? (
        <div className="empty-state">
          <div className="empty-state-icon">◈</div>
          <div className="empty-state-title">No files yet</div>
          <div className="empty-state-desc">Upload your first image or document above.</div>
        </div>
      ) : (
        <div className="media-grid">
          {files.map((file) => (
            <div key={String(file._id)} className="media-card">
              <div className="media-card-thumb">
                {String(file.mimeType ?? "").startsWith("image/") ? (
                  <img src={String(file.url)} alt={String(file.alt ?? file.filename)} loading="lazy" />
                ) : (
                  <span>{fileIcon(String(file.mimeType ?? ""))}</span>
                )}
              </div>
              <div className="media-card-info">
                <div className="media-card-name">{String(file.originalName ?? file.filename)}</div>
                <div className="media-card-size">{formatSize(Number(file.size ?? 0))}</div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 6, width: "100%" }}
                  onClick={() => {
                    void navigator.clipboard.writeText(String(file.url));
                    toast.success("Image URL copied");
                  }}
                >
                  Copy URL
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: 6, width: "100%" }}
                  onClick={() => { if (confirm("Delete this file?")) remove.mutate(String(file._id)); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination meta={query.data?.meta} onPageChange={setPage} />
    </div>
  );
}
