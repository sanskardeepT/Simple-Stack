import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

export function Button({ children, variant = "primary", size, className = "", ...props }: Props) {
  const cls = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", className].filter(Boolean).join(" ");
  return <button className={cls} {...props}>{children}</button>;
}
