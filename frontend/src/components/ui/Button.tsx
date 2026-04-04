import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "danger";
};

const palette = {
  danger: { background: "var(--danger)", color: "#fff" },
  primary: { background: "var(--accent)", color: "#fff" },
  secondary: { background: "rgba(15, 118, 110, 0.08)", color: "var(--accent-strong)" },
};

export function Button({ children, style, variant = "primary", ...props }: Props) {
  return (
    <button
      {...props}
      style={{
        border: "none",
        borderRadius: 14,
        cursor: "pointer",
        fontWeight: 600,
        padding: "10px 16px",
        ...palette[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
