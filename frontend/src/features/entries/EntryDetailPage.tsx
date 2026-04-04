import { useParams } from "react-router-dom";
import { useEntry } from "./useEntries.js";
import { Table } from "../../components/ui/Table.js";

export function EntryDetailPage() {
  const { id = "" } = useParams();
  const query = useEntry(id);

  return (
    <div className="panel stack">
      <h1>Entry Detail</h1>
      <p className="muted">Inspect the current entry record and its structured fields.</p>
      {query.data ? (
        <Table
          columns={[
            { header: "Key", key: "key" },
            { header: "Value", key: "value" },
          ]}
          data={Object.entries(query.data.fields ?? {}).map(([key, value]) => ({
            key,
            value: typeof value === "string" ? value : JSON.stringify(value),
          }))}
        />
      ) : null}
    </div>
  );
}
