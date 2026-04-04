import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client.js";
import { Table } from "../../components/ui/Table.js";

export function UsersPage() {
  const query = useQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data.data as Array<Record<string, unknown>>;
    },
  });

  return (
    <div className="panel stack">
      <h1>Users</h1>
      <Table
        columns={[
          { header: "Name", key: "name" },
          { header: "Email", key: "email" },
          { header: "Role", key: "role" },
          { header: "Active", key: "isActive" },
        ]}
        data={query.data ?? []}
      />
    </div>
  );
}
