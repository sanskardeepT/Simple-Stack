import { useState } from "react";
import { Pagination } from "../../components/ui/Pagination.js";
import { Table } from "../../components/ui/Table.js";
import { useContentTypes } from "./useContentTypes.js";

export function ContentTypesPage() {
  const [page, setPage] = useState(1);
  const query = useContentTypes({ page });

  return (
    <div className="panel stack">
      <div className="page-header">
        <div>
          <h1>Content Types</h1>
          <p className="muted">Define the structured models your editors work with.</p>
        </div>
      </div>
      <Table
        columns={[
          { header: "Name", key: "name" },
          { header: "Slug", key: "slug" },
          { header: "Status", key: "status" },
          {
            header: "Fields",
            key: "fields",
            render: (row) => String(Array.isArray(row.fields) ? row.fields.length : 0),
          },
        ]}
        data={(query.data?.data ?? []) as Array<Record<string, unknown>>}
      />
      <Pagination meta={query.data?.meta} onPageChange={setPage} />
    </div>
  );
}
