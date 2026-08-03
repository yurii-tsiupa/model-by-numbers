import type { TranslationKey } from "@/features/i18n/locales/en";

import type { GuideTroubleshootingData } from "../../../types/GuideTroubleshooting";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { classicPreviewStyles as styles } from "../classic.styles";

export function ClassicTroubleshootingSection({
  data,
  t,
}: {
  data: GuideTroubleshootingData;
  t: (key: TranslationKey) => string;
}) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.troubleshooting.eyebrow")}
        title={t("guide.troubleshooting.title")}
        description={t("guide.troubleshooting.description")}
      />
      <ol className="mt-8 divide-y divide-[var(--border)] border-t border-[var(--border)]">
        {data.items.map((item, itemIndex) => (
          <li key={item.id} className="grid gap-3 py-5 sm:grid-cols-[2rem_1fr]">
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--accent)]">
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--text)]">
                {item.source === "default" ? t(item.titleKey) : item.title}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                {item.source === "default" ? t(item.descriptionKey) : item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
