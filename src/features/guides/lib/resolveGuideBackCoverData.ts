import type { GuideBackCover, ResolvedGuideBackCover } from "../types/GuideBackCover";
import type { ModelGuide } from "../types/ModelGuide";
import { translate } from "@/features/i18n/lib/i18n";
import { normalizeGuideBrandSettings } from "../types/GuideBrandSettings";

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function optionalText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

function optionalColor(value: string | null | undefined): string | null {
  const color = optionalText(value);
  return color && HEX_COLOR_PATTERN.test(color) ? color : null;
}

export function resolveGuideBackCoverData(guide: ModelGuide): ResolvedGuideBackCover | null {
  const author = optionalText(guide.author);
  const genericAuthor = translate(guide.locale ?? "en", "common.user");
  const backCover: GuideBackCover | undefined = guide.backCover ?? (
    author && author !== genericAuthor
      ? { enabled: true, brandName: author }
      : undefined
  );
  if (!backCover?.enabled) return null;
  const socialLinks = normalizeGuideBrandSettings({ socialLinks: backCover.socialLinks }).socialLinks;
  const resolved: ResolvedGuideBackCover = {
    enabled: true,
    brandName: optionalText(backCover.brandName),
    logoUrl: optionalText(backCover.logoUrl),
    headline: optionalText(backCover.headline),
    description: optionalText(backCover.description),
    websiteUrl: optionalText(backCover.websiteUrl),
    socialUrl: optionalText(backCover.socialUrl),
    socialLinks,
    qrValue: optionalText(backCover.qrValue),
    ctaText: optionalText(backCover.ctaText),
    accentColor: optionalColor(backCover.accentColor),
    backgroundColor: optionalColor(backCover.backgroundColor),
  };
  const hasContent = Boolean(
    resolved.brandName
      || resolved.logoUrl
      || resolved.headline
      || resolved.description
      || resolved.websiteUrl
      || resolved.socialUrl
      || resolved.socialLinks.length
      || resolved.qrValue
      || resolved.ctaText,
  );
  return hasContent ? resolved : null;
}
