import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { getApiError } from "../../lib/api/client.js";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useResendOtp, useVerifyOtp } from "./useAuth.js";

const schema = z.object({
  emailCode: z.string().regex(/^\d{6}$/, "Enter the 6 digit email code"),
  smsCode: z.string().regex(/^\d{6}$/, "Enter the 6 digit mobile code"),
});

type FormValues = z.infer<typeof schema>;

export function VerifyOtpPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") ?? "";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const verify = useVerifyOtp();
  const resend = useResendOtp();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) return <Navigate replace to="/app" />;

  async function onSubmit(values: FormValues) {
    await verify.mutateAsync({ email, type: "email", code: values.emailCode });
    const result = await verify.mutateAsync({ email, type: "sms", code: values.smsCode });
    if (result.accessToken) {
      navigate("/app", { replace: true });
    }
  }

  async function resendBoth() {
    await resend.mutateAsync({ email, type: "email" });
    await resend.mutateAsync({ email, type: "sms" });
    toast.success("New OTPs sent");
  }

  return (
    <div className="login-shell">
      <div className="login-card stack">
        <div className="login-logo">
          <div className="login-logo-icon">S</div>
          <div className="login-title">Verify your account</div>
          <div className="login-subtitle">Enter the codes sent to your email and mobile</div>
        </div>

        {!email && (
          <div className="alert alert-error">
            Email is missing. Please <Link to="/register" style={{ color: "var(--accent)" }}>create your account again</Link>.
          </div>
        )}

        {(verify.error || resend.error) && (
          <div className="alert alert-error">
            {getApiError(verify.error ?? resend.error)}
          </div>
        )}

        <form className="stack" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="field-label">Email OTP</label>
            <input className="field-input otp-input" inputMode="numeric" maxLength={6} placeholder="123456" {...register("emailCode")} />
            {errors.emailCode && <span className="field-error">{errors.emailCode.message}</span>}
          </div>
          <div className="field">
            <label className="field-label">Mobile OTP</label>
            <input className="field-input otp-input" inputMode="numeric" maxLength={6} placeholder="123456" {...register("smsCode")} />
            {errors.smsCode && <span className="field-error">{errors.smsCode.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={!email || verify.isPending} style={{ width: "100%", marginTop: 4 }}>
            {verify.isPending ? "Checking codes..." : "Verify and continue"}
          </button>
        </form>

        <button className="btn btn-secondary" disabled={!email || resend.isPending} onClick={resendBoth}>
          {resend.isPending ? "Sending..." : "Send new OTPs"}
        </button>

        <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
          Already verified? <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
