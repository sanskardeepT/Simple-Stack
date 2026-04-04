import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendingChart({ data }: { data: Array<{ title: string; viewCount?: number; trendingScore?: number }> }) {
  const normalized = data.map((item) => ({
    title: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
    value: item.trendingScore ?? item.viewCount ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={normalized} layout="vertical">
        <XAxis type="number" />
        <YAxis dataKey="title" type="category" width={120} />
        <Tooltip />
        <Bar dataKey="value" fill="#115e59" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
