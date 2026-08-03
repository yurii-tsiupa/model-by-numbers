import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import { getGuideLegendItems, type GuideLegendItem } from "../../../lib/getGuideLegendItems";
import type { GuideTargetMode } from "../../../lib/getGuideViewModel";
import { ClassicEyebrow } from "../../../templates/classic/ClassicEyebrow";

type GuideLegendSectionProps = {
  locale: Locale;
  targetMode: GuideTargetMode;
};

function LegendSample({ item }: { item: GuideLegendItem }) {
  if (item.id === "step") {
    return <span className="grid size-9 place-items-center rounded-full bg-[var(--accent)] font-[family-name:var(--font-mono)] text-[11px] font-medium text-[var(--accent-foreground)]">01</span>;
  }
  if (item.id === "marker") {
    return <span className="flex items-end gap-2">{[1, 1].map((number, index) => <span key={index} className="flex flex-col items-center"><span className="grid size-6 place-items-center rounded-full bg-[var(--accent)] font-[family-name:var(--font-mono)] text-[9px] font-medium text-[var(--accent-foreground)]">{number}</span><span className="h-2.5 w-0.5 bg-[var(--accent)]" /></span>)}</span>;
  }
  if (item.id === "region") {
    return <span className="h-9 w-12 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-soft)]" />;
  }
  if (item.id === "part") {
    return <span className="flex gap-1"><span className="h-10 w-7 rounded-md bg-[var(--accent)]" /><span className="mt-2 h-8 w-7 rounded-md border border-[var(--accent)] bg-[var(--accent-soft)]" /></span>;
  }
  if (item.id === "color") {
    return <span className="size-10 rounded-lg border border-[var(--border)] bg-[var(--accent)]" />;
  }
  return <span className="grid h-9 w-12 place-items-center rounded-md border-2 border-[var(--accent)]"><span className="size-4 rounded-full border-2 border-[var(--accent)]" /></span>;
}

export function GuideLegendSection({ locale, targetMode }: GuideLegendSectionProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const items = getGuideLegendItems(targetMode);

  return (
    <section>
      <ClassicEyebrow>{t("guide.legend.eyebrow")}</ClassicEyebrow>
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-4xl">
        {t("guide.legend.title")}
      </h2>
      <p className="mt-4 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-6 text-[var(--text-secondary)]">
        {t("guide.legend.intro")}
      </p>
      <div className="mt-6 border-t border-[var(--border)]">
        {items.map((item) => (
          <div key={item.id} className="flex min-h-20 items-center border-b border-[var(--border)] py-3">
            <div className="mr-5 flex h-14 w-20 shrink-0 items-center justify-center" aria-hidden="true">
              <LegendSample item={item} />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-sm font-medium text-[var(--text)]">
                {t(item.titleKey)}
              </h3>
              <p className="mt-1 font-[family-name:var(--font-body)] text-sm leading-6 text-[var(--text-secondary)]">
                {t(item.descriptionKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
