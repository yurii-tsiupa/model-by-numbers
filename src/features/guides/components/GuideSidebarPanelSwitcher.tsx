import type { TranslationKey } from "@/features/i18n/locales/en";

export type GuideSidebarPanel = "tools" | "design";

export function GuideSidebarPanelSwitcher({
  activePanel,
  onChange,
  t,
}: {
  activePanel: GuideSidebarPanel;
  onChange: (panel: GuideSidebarPanel) => void;
  t: (key: TranslationKey) => string;
}) {
  const options: readonly { id: GuideSidebarPanel; labelKey: TranslationKey }[] = [
    { id: "tools", labelKey: "guide.tools" },
    { id: "design", labelKey: "guide.pdfDesign.title" },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1" role="group" aria-label={t("guide.sidebar.panels")}>
      {options.map((option) => {
        const active = option.id === activePanel;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`min-h-8 cursor-pointer rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none ${active ? "bg-[var(--card)] text-[var(--text)] shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
