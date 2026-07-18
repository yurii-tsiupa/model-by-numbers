import type { EditorMode } from "../types/EditorMode";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function EditorModeSwitch({ mode, onChange }: { mode: EditorMode; onChange: (mode: EditorMode) => void }) {
  const { t } = useTranslation();
  return <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)] px-3 py-2"><p className="hidden min-w-0 truncate text-xs text-[var(--text-secondary)] sm:block">{mode === "simple" ? t("editor.mode.simpleDescription") : t("editor.mode.advancedDescription")}</p><div role="group" aria-label={t("editor.accessibility.modeSwitch")} className="ml-auto flex shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1">{(["simple", "advanced"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => onChange(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${mode === value ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--text-secondary)]"}`}>{t(`editor.mode.${value}`)}</button>)}</div></div>;
}
