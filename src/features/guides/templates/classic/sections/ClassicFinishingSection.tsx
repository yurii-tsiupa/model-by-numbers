/* eslint-disable @next/next/no-img-element */
import type { TranslationKey } from "@/features/i18n/locales/en";

import { getGuideFinishingItemTitleKey } from "../../../lib/resolveGuideFinishingData";
import type { GuideFinishingData } from "../../../types/GuideFinishing";
import { ClassicSectionHeading } from "../ClassicSectionHeading";
import { classicPreviewStyles as styles } from "../classic.styles";

export function ClassicFinishingSection({
  data,
  t,
}: {
  data: GuideFinishingData;
  t: (key: TranslationKey) => string;
}) {
  return (
    <section className={styles.section}>
      <ClassicSectionHeading
        eyebrow={t("guide.finishing.eyebrow")}
        title={t("guide.finishing.title")}
        description={t("guide.finishing.description")}
      />
      <ol className="mt-8 divide-y divide-[var(--border)] border-t border-[var(--border)]">
        {data.items.map((item, itemIndex) => {
          const title = item.title ?? t(getGuideFinishingItemTitleKey(item.type));
          return (
            <li key={item.id} className="grid gap-4 py-6 sm:grid-cols-[2rem_1fr]">
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--accent)]">
                {String(itemIndex + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--text)]">{title}</h3>
                {item.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p> : null}
                {item.image ? <div className="mt-4 flex max-h-[30rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"><img src={item.image.src} alt={title} className="max-h-[28rem] w-full object-contain" /></div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
