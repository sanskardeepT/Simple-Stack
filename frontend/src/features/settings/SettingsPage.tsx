import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { useChangePassword } from "../auth/useAuth.js";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use upper, lower, number, and special char"),
});

type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const mutation = useChangePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="panel stack">
      <h1>Settings</h1>
      <form
        className="stack"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <Input label="Current Password" type="password" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <Input label="New Password" type="password" error={errors.newPassword?.message} {...register("newPassword")} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Change password"}
        </Button>
      </form>
    </div>
  );
}
