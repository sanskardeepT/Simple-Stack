export function BlogPage() {
  const posts = [
    ["Why SimpleStack exists", "A calmer CMS for teams that should be shipping, not wrestling plugins."],
    ["Designing the one-line connect flow", "How we kept the public API simple enough to paste into any site."],
    ["Making SaaS pricing feel honest", "Why we chose a tiny monthly plan instead of complicated tiers."],
  ];

  return (
    <div className="marketing-shell marketing-simple-page">
      <div className="section-kicker">Blog</div>
      <h1 className="hero-title">Notes from building SimpleStack.</h1>
      <div className="grid-3">
        {posts.map(([title, text]) => (
          <article key={title} className="blog-card">
            <span className="blog-chip">Inside the build</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
