import type { ComponentProps } from "react";

export function AuthField({ id, label, error, ...input }: { id: string; label: string; error?: string } & Omit<ComponentProps<"input">, "id">) {
  const errorId = `${id}-error`;
  return <label htmlFor={id} className="block text-sm font-medium text-[var(--text)]">{label}<input {...input} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="mt-2 h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"/>{error ? <span id={errorId} className="mt-1.5 block text-xs text-[var(--accent)]">{error}</span> : null}</label>;
}
