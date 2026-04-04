import { useState } from "react";
import { Pagination } from "../../components/ui/Pagination.js";
import { Table } from "../../components/ui/Table.js";
import { useMedia } from "./useMedia.js";

export function MediaPage() {
  const [page, setPage] = useState(1);
  const query = useMedia({ page });

  return (
    <div className="panel stack">
      <div className="page-header">
        <div>
          <h1>Media Library</h1>
          <p className="muted">Track uploaded assets and delivery metadata.</p>
        </div>
      </div>
      <Table
        columns={[
          { header: "Filename", key: "filename" },
          { header: "Type", key: "mimeType" },
          { header: "Size", key: "size" },
          { header: "URL", key: "url" },
        ]}
        data={(query.data?.data ?? []) as Array<Record<string, unknown>>}
      />
      <Pagination meta={query.data?.meta} onPageChange={setPage} />
    </div>
  );
}
