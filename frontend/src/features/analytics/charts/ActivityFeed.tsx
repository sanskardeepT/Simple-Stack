import { formatDistanceToNow } from "date-fns";

const icons: Record<string, string> = {
  click: "Cursor",
  error: "Alert",
  login: "User",
  search: "Search",
  view: "Eye",
};

export function ActivityFeed({ data }: { data: Array<Record<string, unknown>> }) {
  return (
    <div className="stack">
      {data.map((item, index) => {
        const user = item.userId as { name?: string } | undefined;
        const event = String(item.event ?? "event");
        return (
          <div key={`${event}-${index}`} className="panel" style={{ borderRadius: 18, padding: 16 }}>
            <strong>{icons[event] ?? "Event"}</strong>
            <p style={{ margin: "8px 0 4px" }}>
              {(user?.name ?? "Anonymous")} triggered <strong>{event}</strong>
            </p>
            <span className="muted">
              {formatDistanceToNow(new Date(String(item.createdAt ?? Date.now())), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
