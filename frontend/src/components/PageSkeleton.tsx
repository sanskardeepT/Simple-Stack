export function PageSkeleton() {
  return (
    <div className="stack-lg" style={{ padding: "28px 32px" }}>
      <div style={{ height: 28, width: 200, background: "var(--surface)", borderRadius: 8, animation: "pulse 1.5s ease infinite" }} />
      <div className="panel">
        {[80, 60, 70, 50].map((w, i) => (
          <div key={i} style={{ height: 14, width: `${w}%`, background: "var(--surface-hover)", borderRadius: 6, marginBottom: 12, animation: "pulse 1.5s ease infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
