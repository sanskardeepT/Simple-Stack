import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { useAuthStore } from "../../lib/store/auth.store.js";
import { useRegister } from "./useAuth.js";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use upper, lower, number, and special char"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const registerMutation = useRegister();
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
          await registerMutation.mutateAsync(values);
          navigate("/", { replace: true });
        })}
      >
        <h1>Create account</h1>
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating..." : "Create account"}
        </Button>
        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
