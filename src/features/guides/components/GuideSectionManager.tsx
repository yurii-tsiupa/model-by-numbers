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
    <section className="mt-4 border-t border-[var(--border)] pt-4">
      <h3 className="text-xs font-semibold text-[var(--text)]">{t("guide.sections.title")}</h3>
      <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">{t("guide.sections.helper")}</p>
      <div className="mt-2 space-y-1">
        {controls.map((control) => {
          const unavailable = !control.available;
          const inputDisabled = disabled || unavailable;
          const selected = control.available && control.enabled;
          return (
            <label
              key={control.id}
              className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${inputDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${selected ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-hover)]"}`}
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
              <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--card)] ${selected ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]" : "border-[var(--border)] bg-[var(--card)] text-transparent"}`}>
                <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-[var(--text)]">{t(control.titleKey)}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[var(--text-secondary)]">{unavailable ? t("guide.sections.unavailable") : t(control.descriptionKey)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
