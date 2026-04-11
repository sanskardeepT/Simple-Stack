import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useChangePassword } from "../auth/useAuth.js";

const schema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use upper, lower, number & symbol"),
});
type F = z.infer<typeof schema>;

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const mutation = useChangePassword();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage your account preferences.</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel stack">
          <div className="section-title">Your Profile</div>
          <div className="row">
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-glow)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div className="muted text-sm">{user?.email}</div>
              <span className="badge badge-blue" style={{ marginTop: 4 }}>{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="panel stack">
          <div className="section-title">Change Password</div>
          <form className="stack" onSubmit={handleSubmit(async (v) => {
            await mutation.mutateAsync(v);
            toast.success("Password changed!");
            reset();
          })}>
            <div className="field">
              <label className="field-label">Current Password</label>
              <input className="field-input" type="password" {...register("currentPassword")} />
              {errors.currentPassword && <span className="field-error">{errors.currentPassword.message}</span>}
            </div>
            <div className="field">
              <label className="field-label">New Password</label>
              <input className="field-input" type="password" placeholder="Min 8 chars, mixed case + symbol" {...register("newPassword")} />
              {errors.newPassword && <span className="field-error">{errors.newPassword.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending} style={{ alignSelf: "flex-start" }}>
              {mutation.isPending ? "Saving…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
