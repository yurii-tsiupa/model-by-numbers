import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import { GUIDE_KIT_CATEGORY_ORDER, resolveGuideKitItemName } from "../../../lib/getGuideKitItems";
import type { GuideKitCategory, GuideKitItem } from "../../../types/GuideKit";
import { ClassicEyebrow } from "../../../templates/classic/ClassicEyebrow";

type GuideKitSectionProps = {
  items: readonly GuideKitItem[];
  locale: Locale;
};

const categoryTitleKeys: Record<GuideKitCategory, Parameters<typeof translate>[1]> = {
  paint: "guide.kit.paints",
  brush: "guide.kit.brushes",
  tool: "guide.kit.tools",
  material: "guide.kit.materials",
};

export function GuideKitSection({ items, locale }: GuideKitSectionProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <section>
      <ClassicEyebrow>{t("guide.kit.eyebrow")}</ClassicEyebrow>
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-4xl">
        {t("guide.kit.title")}
      </h2>
      <p className="mt-4 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-6 text-[var(--text-secondary)]">
        {t("guide.kit.description")}
      </p>
      <div className="mt-6 space-y-5">
        {GUIDE_KIT_CATEGORY_ORDER.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (!categoryItems.length) return null;
          return (
            <section key={category}>
              <h3 className="font-[family-name:var(--font-display)] text-sm font-medium text-[var(--accent)]">
                {t(categoryTitleKeys[category])}
              </h3>
              <ul className="mt-2 border-t border-[var(--border)]">
                {categoryItems.map((item) => (
                  <li key={item.id} className="flex min-h-10 items-center border-b border-[var(--border)] py-2 text-sm">
                    {item.colorHex ? <span className="mr-3 size-5 rounded-md border border-[var(--border)]" style={{ backgroundColor: item.colorHex }} aria-hidden="true" /> : <span className="mx-2 mr-5 size-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />}
                    {item.code ? <span className="mr-3 w-12 font-[family-name:var(--font-mono)] text-xs text-[var(--text-secondary)]">{item.code}</span> : null}
                    <span className="font-[family-name:var(--font-body)] text-[var(--text)]">{resolveGuideKitItemName(item, t)}</span>
                    {item.colorHex ? <span className="ml-auto pl-3 font-[family-name:var(--font-mono)] text-xs text-[var(--text-secondary)]">{item.colorHex.toUpperCase()}</span> : null}
                    {item.quantity ? <span className={`${item.colorHex ? "ml-3" : "ml-auto"} pl-3 text-xs text-[var(--text-secondary)]`}>{item.quantity}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
