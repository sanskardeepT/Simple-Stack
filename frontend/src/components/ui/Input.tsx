import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ error, label, ...props }: Props) {
  return (
    <label className="stack" style={{ gap: 8 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input
        {...props}
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "12px 14px",
        }}
      />
      {error ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{error}</span> : null}
    </label>
  );
}
