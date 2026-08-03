/* eslint-disable @next/next/no-img-element */
import type { ResolvedGuideBackCover } from "../../../types/GuideBackCover";
import { classicPreviewInlineStyles as inlineStyles, classicPreviewStyles as styles } from "../classic.styles";

export function ClassicBackCoverSection({ data }: { data: ResolvedGuideBackCover }) {
  const destination = data.websiteUrl ?? data.socialUrl ?? data.qrValue;
  const accentStyle = data.accentColor ? { color: data.accentColor } : undefined;

  return (
    <section
      className={`${styles.section} flex min-h-[34rem] flex-col items-center justify-center px-6 py-20 text-center`}
    >
      {data.logoUrl ? <img src={data.logoUrl} alt={data.brandName ?? ""} className="mb-8 max-h-28 max-w-48 object-contain" /> : null}
      {data.brandName ? <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--text)]" style={accentStyle}>{data.brandName}</h2> : null}
      {data.headline ? <h3 className="mt-7 max-w-xl font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text)]">{data.headline}</h3> : null}
      {data.description ? <p className="mt-3 max-w-xl text-sm leading-6" style={inlineStyles.description}>{data.description}</p> : null}
      {data.ctaText ? <p className="mt-10 text-sm font-semibold text-[var(--accent)]" style={accentStyle}>{data.ctaText}</p> : null}
      {destination ? <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--text-secondary)]">{destination}</p> : null}
    </section>
  );
}
