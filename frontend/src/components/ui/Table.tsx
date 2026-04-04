import type { ReactNode } from "react";

type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
};

export function Table<T extends Record<string, unknown>>({ columns, data }: Props<T>) {
  if (!data.length) {
    return <div className="empty-state">No records found.</div>;
  }

  return (
    <div className="table-wrap">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ borderBottom: "1px solid var(--border)", padding: "12px", textAlign: "left" }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={String(row._id ?? rowIndex)}>
              {columns.map((column) => (
                <td key={String(column.key)} style={{ borderBottom: "1px solid var(--border)", padding: "12px" }}>
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
