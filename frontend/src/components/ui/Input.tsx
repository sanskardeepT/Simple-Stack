import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; };

export function Input({ error, hint, label, className = "", ...props }: Props) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input className={`field-input ${className}`} {...props} />
      {error && <span className="field-error">{error}</span>}
      {hint && !error && <span className="field-hint">{hint}</span>}
    </div>
  );
}
