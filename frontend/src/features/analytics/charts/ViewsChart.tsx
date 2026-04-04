import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ViewsChart({ data }: { data: Array<{ _id: string; count: number }> }) {
  const formatted = data.map((item) => ({
    date: item._id.slice(5).replace("-", "/"),
    views: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted}>
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Line type="monotone" dataKey="views" stroke="#0f766e" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
