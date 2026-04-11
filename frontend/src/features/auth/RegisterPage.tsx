import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useRegister } from "./useAuth.js";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use upper, lower, number, and special char"),
});
type F = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const reg = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate replace to="/" />;

  return (
    <div className="login-shell">
      <div className="login-card stack">
        <div className="login-logo">
          <div className="login-logo-icon">S</div>
          <div className="login-title">Create account</div>
          <div className="login-subtitle">Start managing your content for free</div>
        </div>

        {reg.error && (
          <div className="alert alert-error">
            {reg.error instanceof Error ? reg.error.message : "Registration failed. Try again."}
          </div>
        )}

        <form className="stack" onSubmit={handleSubmit(async (v) => { await reg.mutateAsync(v); navigate("/", { replace: true }); })}>
          <div className="field">
            <label className="field-label">Your name</label>
            <input className="field-input" placeholder="Jane Smith" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>
          <div className="field">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="Min 8 chars, mixed case + symbol" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={reg.isPending} style={{ width: "100%", marginTop: 4 }}>
            {reg.isPending ? "Creating account…" : "Create account →"}
          </button>
        </form>
        <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
          Already have one? <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
