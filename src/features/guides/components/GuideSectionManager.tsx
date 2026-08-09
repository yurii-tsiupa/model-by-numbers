import { Check } from "lucide-react";
import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideSectionControl } from "../config/guideSectionRegistry";
import type { GuideSectionSettings } from "../types/GuideSectionSettings";

export function GuideSectionManager({
  controls,
  disabled,
  onChange,
  settings,
  t,
}: {
  controls: readonly GuideSectionControl[];
  disabled: boolean;
  onChange: (settings: GuideSectionSettings) => void;
  settings: GuideSectionSettings;
  t: (key: TranslationKey) => string;
}) {
  return (
    <section className="mt-3 border-t border-[var(--border)] pt-3">
      <h3 className="text-[13px] font-semibold text-[var(--text)]">{t("guide.sections.title")}</h3>
      <p className="mt-0.5 text-[10.5px] leading-4 text-[var(--text-secondary)]">{t("guide.sections.helper")}</p>
      <div className="mt-2 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">
        {controls.map((control) => {
          const unavailable = !control.available;
          const inputDisabled = disabled || unavailable;
          const selected = control.available && control.enabled;
          return (
            <label
              key={control.id}
              className={`flex min-h-9 items-center gap-2 px-2.5 py-1.5 ${inputDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[var(--surface-hover)]"}`}
            >
              <input
                type="checkbox"
                checked={control.available && control.enabled}
                disabled={inputDisabled}
                onChange={(event) => onChange({
                  ...settings,
                  [control.settingsKey]: { enabled: event.target.checked },
                })}
                className="peer sr-only"
              />
              <span className={`grid size-3.5 shrink-0 place-items-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--card)] ${selected ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]" : "border-[var(--border-strong)] bg-transparent text-transparent"}`}>
                <Check className="size-2.5" strokeWidth={2.75} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--text)]">
                {t(control.titleKey)}<span className="ml-1 font-normal text-[10.5px] text-[var(--text-secondary)]">— {unavailable ? t("guide.sections.unavailable") : t(control.descriptionKey)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
