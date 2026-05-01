import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../../components/ui/Pagination.js";
import { useCreateMedia, useDeleteMedia, useMedia } from "./useMedia.js";

const MAX_IMAGE_SIZE_BYTES = 300 * 1024;

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
    const selectedFiles = Array.from(fileList);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    const oversizedFiles = imageFiles.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    const uploadableFiles = imageFiles.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);

    if (selectedFiles.length !== imageFiles.length) {
      toast.error("Only image files are allowed");
    }

    if (oversizedFiles.length > 0) {
      toast.error("Each image must be 300KB or less");
    }

    uploadableFiles.forEach((file) => {
      const fd = new FormData();
      fd.append("file", file);
      upload.mutate(fd);
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Media Library</div>
          <div className="page-subtitle">Upload small images, copy the URL, and reuse them anywhere.</div>
        </div>
        <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>Upload image</button>
      </div>

      <div
        className="media-dropzone"
        style={{
          border: dragging ? "2px dashed var(--accent)" : "2px dashed var(--border)",
          background: dragging ? "var(--accent-glow)" : "var(--surface)",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="media-dropzone-icon">+</div>
        <div>
          <div className="media-dropzone-title">Drop images here</div>
          <div className="muted text-sm">JPG, PNG, WebP, or GIF. Max size: 300KB per image.</div>
        </div>
        <span className="badge badge-blue">300KB max</span>
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
        <div className="alert alert-success">Uploading image...</div>
      )}

      {files.length === 0 && !query.isPending ? (
        <div className="empty-state">
          <div className="empty-state-icon">◈</div>
          <div className="empty-state-title">No images yet</div>
          <div className="empty-state-desc">Upload your first image above.</div>
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
