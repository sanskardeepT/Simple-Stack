import { useState } from "react";
import { useAuthStore } from "../../lib/store/auth.store.js";

export function ConnectPage() {
  useAuthStore((s) => s.user);
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? window.location.origin;
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => undefined);
  }

  const snippets = {
    fetch: `// Paste this in your website's JavaScript
const CMS_URL = "${apiBase}/api/v1";

async function getContent(contentTypeId) {
  const response = await fetch(
    CMS_URL + "/entries?contentTypeId=" + contentTypeId + "&status=published"
  );
  const data = await response.json();
  return data.data; // Array of content entries
}

// Example: Show blog posts
getContent("YOUR_CONTENT_TYPE_ID").then(posts => {
  posts.forEach(post => {
    console.log(post.title, post.fields);
  });
});`,

    wordpress: `// Add to your theme's functions.php
function simplestack_get_content($content_type_id) {
  $url = "${apiBase}/api/v1/entries?contentTypeId=" . $content_type_id . "&status=published";
  $response = wp_remote_get($url);
  if (is_wp_error($response)) return [];
  $body = wp_remote_retrieve_body($response);
  $data = json_decode($body, true);
  return $data['data'] ?? [];
}`,

    nextjs: `// pages/blog.js or app/blog/page.jsx
export async function getStaticProps() {
  const res = await fetch(
    "${apiBase}/api/v1/entries?status=published&contentTypeId=YOUR_TYPE_ID"
  );
  const data = await res.json();
  return { props: { posts: data.data }, revalidate: 60 };
}`,
  };

  const steps = [
    {
      num: "1",
      title: "Create a Content Type",
      desc: 'Go to "Content Types" and create a type like "Blog Post" with fields: title (text), body (richtext), image (media).',
      href: "/content-types",
      cta: "Go to Content Types →",
    },
    {
      num: "2",
      title: "Add your content",
      desc: 'Go to "Content" and add entries. Set status to "Published" so they appear on your website.',
      href: "/entries",
      cta: "Go to Content →",
    },
    {
      num: "3",
      title: "Copy the code snippet",
      desc: "Pick the snippet below that matches your website platform and paste it into your site.",
      href: null,
      cta: null,
    },
  ];

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Connect Your Website</div>
          <div className="page-subtitle">3 simple steps to show your CMS content on your website.</div>
        </div>
      </div>

      <div className="connect-card stack">
        <div className="section-title">Your API Endpoint</div>
        <div className="muted text-sm" style={{ marginBottom: 4 }}>
          This is your personal CMS API URL. Your website fetches content from here.
        </div>
        <div className="connect-url-row">
          <span style={{ flex: 1 }}>{apiBase}/api/v1/entries</span>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(`${apiBase}/api/v1/entries`, "url")}>
            {copied === "url" ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="stack">
        <div className="section-title">How to connect — 3 steps</div>
        <div className="grid-3">
          {steps.map((step) => (
            <div key={step.num} className="panel stack-sm">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-glow)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--accent)", fontSize: 13 }}>
                  {step.num}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{step.title}</div>
              </div>
              <div className="muted text-sm">{step.desc}</div>
              {step.href && (
                <a href={step.href} className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>{step.cta}</a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="stack">
        <div className="section-title">Code Snippets — Pick your platform</div>
        {(["fetch", "nextjs", "wordpress"] as const).map((key) => {
          const labels = { fetch: "Any Website (Vanilla JS)", nextjs: "Next.js / React", wordpress: "WordPress (PHP)" };
          return (
            <div key={key} className="panel stack-sm">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600 }}>{labels[key]}</div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(snippets[key], key)}>
                  {copied === key ? "✓ Copied!" : "Copy code"}
                </button>
              </div>
              <pre style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "16px", fontSize: 12, lineHeight: 1.6, overflowX: "auto", color: "var(--text-2)", margin: 0 }}>
                <code>{snippets[key]}</code>
              </pre>
            </div>
          );
        })}
      </div>

      <div className="panel stack-sm" style={{ background: "rgba(104,211,145,0.04)", borderColor: "rgba(104,211,145,0.2)" }}>
        <div style={{ fontWeight: 600, color: "var(--success)" }}>✓ Your API is live and ready</div>
        <div className="muted text-sm">
          Any published content you create will instantly appear at your API endpoint. No rebuild needed.
          Changes you make in this CMS reflect on your website within seconds.
        </div>
      </div>
    </div>
  );
}
