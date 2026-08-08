import type { GuideBrandSocialLink } from "../types/GuideBrandSettings";

const PLATFORM_LABELS: Record<GuideBrandSocialLink["type"], string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  other: "↗",
};

function shorten(value: string, limit = 32): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}

export function getGuideWebsiteLabel(value: string): string {
  try {
    return shorten(new URL(value).hostname.replace(/^www\./i, ""));
  } catch {
    return shorten(value);
  }
}

export function getGuideSocialLabel(link: GuideBrandSocialLink): string {
  if (link.label) return shorten(link.label);
  try {
    const url = new URL(link.url);
    const segment = decodeURIComponent(url.pathname.split("/").filter(Boolean).at(-1) ?? "");
    if (segment) return shorten(link.type === "other" || segment.startsWith("@") ? segment : `@${segment}`);
    return shorten(url.hostname.replace(/^www\./i, ""));
  } catch {
    return shorten(link.url);
  }
}

export function getGuideSocialPlatformLabel(type: GuideBrandSocialLink["type"]): string {
  return PLATFORM_LABELS[type];
}
