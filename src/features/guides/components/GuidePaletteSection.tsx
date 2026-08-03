import { formatCount, translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type { GuidePaletteColor } from "../types/ModelGuide";
import { ClassicEyebrow } from "../templates/classic/ClassicEyebrow";
import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { isLightGuideColor } from "../design/isLightGuideColor";

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
      <ClassicEyebrow>{t("guide.paintReference")}</ClassicEyebrow>

      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl" style={{color:tokens.inkPrimary,fontFamily:tokens.headingFont}}>
        {t("guide.palette")}
      </h2>

      <p className="mt-3 max-w-3xl leading-6" style={{color:tokens.inkMuted,fontFamily:tokens.bodyFont,fontSize:tokens.sizeBody}}>
        {t("pdf.paletteHelp", { count: palette.length })}
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2" style={{gap:tokens.spacingMd}}>
        {palette.map((color) => (
          <article
            key={color.id}
            className="min-w-0 overflow-hidden border"
            style={{backgroundColor:tokens.paperBackground,borderColor:tokens.borderColor,borderRadius:tokens.radiusCard}}
          >
            <span
              className="block h-[60px] w-full"
              style={{
                backgroundColor: color.hex,
                border: isLightGuideColor(color.hex) ? `${tokens.borderWidth}px solid ${tokens.borderColor}` : undefined,
              }}
            />

            <div className="min-w-0" style={{padding:tokens.spacingSm}}>
              <p className="truncate font-semibold" style={{color:tokens.inkPrimary,fontFamily:tokens.bodyFont,fontSize:tokens.sizeBody}}>
                {formatColorNumber(color.number)} · {color.name}
              </p>

              <div className="flex items-center justify-between" style={{gap:tokens.spacingSm,marginTop:tokens.spacingXs}}>
                <span style={{color:tokens.inkMuted,fontFamily:tokens.monoFont,fontSize:tokens.sizeCaption}}>{color.hex.toUpperCase()}</span>
                <span className="inline-flex items-center" style={{backgroundColor:tokens.accentSoft,borderRadius:tokens.radiusPill,color:tokens.accentColor,fontFamily:tokens.monoFont,fontSize:tokens.sizeCaption,padding:`${tokens.spacingXs}px ${tokens.spacingSm}px`}}>
                  {formatCount(locale, color.usageCount, "step")}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
