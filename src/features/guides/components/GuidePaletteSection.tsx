import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type { GuidePaletteColor } from "../types/ModelGuide";

type GuidePaletteSectionProps = {
  palette: GuidePaletteColor[];
  locale: Locale;
};

function formatColorNumber(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function GuidePaletteSection({
  palette,
  locale,
}: GuidePaletteSectionProps) {
  const t = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  return (
    <section className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#76558F]" />

        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#76558F]">
          {t("guide.paintReference")}
        </p>
      </div>

      <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.04em] text-[#181221] sm:text-4xl">
        {t("guide.palette")}
      </h2>

      <p className="mt-3 max-w-3xl font-[family-name:var(--font-inter)] text-sm leading-6 text-[#716A79]">
        {t("guide.paletteDescription")}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {palette.map((color) => (
          <article
            key={color.id}
            className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#E3DEEC] bg-white p-4"
          >
            <span
              className="h-16 w-16 shrink-0 rounded-2xl border border-[#D5CFDD]"
              style={{
                backgroundColor: color.hex,
              }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex min-h-7 items-center rounded-full border border-[#D6CAE0] bg-[#F7F3FA] px-2.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold tracking-[0.08em] text-[#76558F]">
                  {formatColorNumber(color.number)}
                </span>

                <span className="inline-flex min-h-7 items-center rounded-full border border-[#E3DEEC] bg-[#FAF9FC] px-2.5 font-[family-name:var(--font-inter)] text-xs text-[#716A79]">
                  {t("guide.usedBy", {
                    count: color.usageCount,
                  })}
                </span>
              </div>

              <p className="mt-3 truncate font-[family-name:var(--font-inter)] text-sm font-semibold text-[#181221]">
                {color.name}
              </p>

              <p className="mt-1 font-[family-name:var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.08em] text-[#8A8291]">
                {color.hex.toUpperCase()}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}