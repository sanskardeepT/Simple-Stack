import { useState } from "react";
import { Pagination } from "../../components/ui/Pagination.js";
import { Table } from "../../components/ui/Table.js";
import { useEntries } from "./useEntries.js";

export function EntriesPage() {
  const [page, setPage] = useState(1);
  const query = useEntries({ page });

  return (
    <div className="panel stack">
      <div className="page-header">
        <div>
          <h1>Entries</h1>
          <p className="muted">Manage structured content across your CMS.</p>
        </div>
      </div>
      <Table
        columns={[
          { header: "Title", key: "title" },
          { header: "Slug", key: "slug" },
          { header: "Status", key: "status" },
          { header: "Updated", key: "updatedAt" },
        ]}
        data={(query.data?.data ?? []) as Array<Record<string, unknown>>}
      />
      <Pagination meta={query.data?.meta} onPageChange={setPage} />
    </div>
  );
}
