export function PageSkeleton() {
  return (
    <div className="app-shell">
      <div className="panel" style={{ minHeight: 240 }}>
        <div style={{ background: "rgba(15,118,110,0.1)", borderRadius: 12, height: 24, marginBottom: 16, width: "40%" }} />
        <div style={{ background: "rgba(15,118,110,0.08)", borderRadius: 12, height: 16, marginBottom: 12, width: "70%" }} />
        <div style={{ background: "rgba(15,118,110,0.08)", borderRadius: 12, height: 16, width: "60%" }} />
      </div>
    </div>
  );
}
