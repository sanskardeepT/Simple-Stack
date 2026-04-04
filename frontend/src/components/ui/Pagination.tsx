import type { PaginatedMeta } from "../../types/api.types.js";
import { Button } from "./Button.js";

type Props = {
  meta?: Partial<PaginatedMeta>;
  onPageChange: (page: number) => void;
};

export function Pagination({ meta, onPageChange }: Props) {
  const page = Number(meta?.page ?? 1);
  const totalPages = Number(meta?.totalPages ?? 1);

  return (
    <div style={{ alignItems: "center", display: "flex", gap: 12, justifyContent: "space-between", marginTop: 16 }}>
      <span className="muted">
        Page {page} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
