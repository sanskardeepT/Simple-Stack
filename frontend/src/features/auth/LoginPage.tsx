import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useLogin } from "./useAuth.js";
import { getApiError } from "../../lib/api/client.js";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type F = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate replace to="/app" />;

  return (
    <div className="login-shell">
      <div className="login-card stack">
        <div className="login-logo">
          <div className="login-logo-icon">S</div>
          <div className="login-title">SimpleStack</div>
          <div className="login-subtitle">Sign in to your CMS</div>
        </div>

        {login.error && (
          <div className="alert alert-error">
            {getApiError(login.error)}
          </div>
        )}

        <form className="stack" onSubmit={handleSubmit(async (v) => {
          await login.mutateAsync(v);
          navigate((location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/app", { replace: true });
        })}>
          <div className="field">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={login.isPending} style={{ width: "100%", marginTop: 4 }}>
            {login.isPending ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
          No account? <Link to="/register" style={{ color: "var(--accent)" }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
