type Meta = { page?: number; total?: number; limit?: number; totalPages?: number } | undefined;

export function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
  if (!meta || (meta.totalPages ?? 1) <= 1) return null;
  const current = meta.page ?? 1;
  const total = meta.totalPages ?? 1;

  return (
    <div className="pagination">
      <button className="btn btn-secondary btn-sm" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>← Prev</button>
      <span className="pagination-info">Page {current} of {total}</span>
      <button className="btn btn-secondary btn-sm" disabled={current >= total} onClick={() => onPageChange(current + 1)}>Next →</button>
    </div>
  );
}
