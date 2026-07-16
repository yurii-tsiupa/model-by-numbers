import type { GuidePaletteColor } from "../types/ModelGuide";
import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";

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
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  return (
    <section className="scroll-mt-24">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
          {t("guide.paintReference")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {t("guide.palette")}
        </h2>
      </div>

      <p className="mt-2 text-sm text-neutral-500">{t("guide.paletteDescription")}</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {palette.map((color) => (
          <article
            key={color.id}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-4 shadow-lg shadow-black/15 transition hover:border-white/15"
          >
            <span
              className="h-16 w-16 shrink-0 rounded-2xl border border-white/20 shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 font-mono text-xs font-bold text-orange-300">
                  {formatColorNumber(color.number)}
                </p>
                <p className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-neutral-400">
                  {t("guide.usedBy",{count:color.usageCount})}
                </p>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {color.name}
              </p>
              <p className="mt-0.5 font-mono text-xs text-neutral-500">
                {color.hex.toUpperCase()}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
