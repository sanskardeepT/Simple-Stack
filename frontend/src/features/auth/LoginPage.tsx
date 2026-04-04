import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useLogin } from "./useAuth.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="login-shell">
      <form
        className="login-card stack"
        onSubmit={handleSubmit(async (values) => {
          await login.mutateAsync(values);
          const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
          navigate(destination, { replace: true });
        })}
      >
        <h1>Sign in</h1>
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" disabled={login.isPending}>{login.isPending ? "Signing in..." : "Sign in"}</Button>
        <p className="muted">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
