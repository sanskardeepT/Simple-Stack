import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getApiError } from "../../lib/api/client.js";
import { useEnsureDefaultProject, useProjects, useUpdateWebhook } from "./useProjects.js";

export function ConnectPage() {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? window.location.origin;
  const projects = useProjects();
  const ensureDefault = useEnsureDefaultProject();
  const updateWebhook = useUpdateWebhook();
  const [copied, setCopied] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  const project = projects.data?.[0];

  useEffect(() => {
    if (!project && !projects.isPending && !ensureDefault.isPending) {
      ensureDefault.mutate();
    }
  }, [ensureDefault, project, projects.isPending]);

  useEffect(() => {
    setWebhookUrl(project?.webhookUrl ?? "");
  }, [project?.webhookUrl]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => undefined);
  }

  async function saveWebhook() {
    if (!project) return;
    try {
      await updateWebhook.mutateAsync({ projectId: project.projectId, webhookUrl });
      toast.success("Webhook saved");
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  const embedSnippet = project ? `<script src="${window.location.origin}/connect.js" data-project="${project.projectId}" data-api-key="${project.apiKey}" data-api-base="${apiBase}/api/v1"></script>` : `<script src="https://cdn.simplestack.in/connect.js" data-project="PROJECT_ID"></script>`;
  const contentTypesEndpoint = project ? `${apiBase}/api/v1/public/${project.projectId}/content-types?apiKey=${project.apiKey}` : "";
  const entriesEndpoint = project ? `${apiBase}/api/v1/public/${project.projectId}/entries/menu-items?apiKey=${project.apiKey}` : "";
  const heartbeatEndpoint = project ? `${apiBase}/api/v1/public/${project.projectId}/heartbeat` : "";

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Connect your website</div>
          <div className="page-subtitle">Use one script tag or call the public API directly.</div>
        </div>
      </div>

      <div className="connect-card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="section-title">Project connection</div>
            <div className="muted text-sm">Each website gets a project ID and API key.</div>
          </div>
          <span className={`badge ${project?.connected ? "badge-green" : "badge-yellow"}`}>
            {project?.connected ? "Connected in last 24h" : "Waiting for website"}
          </span>
        </div>
        <div className="grid-2">
          <div className="panel stack-sm">
            <div className="field-label">Project ID</div>
            <div className="code-chip">{project?.projectId ?? "Creating..."}</div>
          </div>
          <div className="panel stack-sm">
            <div className="field-label">API key</div>
            <div className="code-chip">{project?.apiKey ? `${project.apiKey.slice(0, 16)}...` : "Creating..."}</div>
          </div>
        </div>
      </div>

      <div className="panel stack-sm">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="section-title">1-line embed script</div>
            <div className="muted text-sm">Paste this before the closing body tag on your website.</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(embedSnippet, "embed")}>
            {copied === "embed" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="code-block"><code>{embedSnippet}</code></pre>
      </div>

      <div className="grid-2">
        <div className="panel stack-sm">
          <div className="section-title">Public API endpoints</div>
          <div className="field-label">Content structures</div>
          <div className="connect-url-row"><span style={{ flex: 1 }}>{contentTypesEndpoint}</span><button className="btn btn-secondary btn-sm" onClick={() => copy(contentTypesEndpoint, "types")}>Copy</button></div>
          <div className="field-label">Published items by slug</div>
          <div className="connect-url-row"><span style={{ flex: 1 }}>{entriesEndpoint}</span><button className="btn btn-secondary btn-sm" onClick={() => copy(entriesEndpoint, "entries")}>Copy</button></div>
        </div>

        <div className="panel stack-sm">
          <div className="section-title">Webhook refresh</div>
          <div className="muted text-sm">Add your website refresh URL. Publishing content will use this in the next step.</div>
          <input className="field-input" placeholder="https://your-site.com/api/refresh" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
          <button className="btn btn-primary btn-sm" disabled={!project || updateWebhook.isPending} onClick={saveWebhook}>Save webhook</button>
          <div className="field-label">Heartbeat URL</div>
          <div className="connect-url-row"><span style={{ flex: 1 }}>{heartbeatEndpoint}</span><button className="btn btn-secondary btn-sm" onClick={() => copy(heartbeatEndpoint, "heartbeat")}>Copy</button></div>
        </div>
      </div>
    </div>
  );
}
