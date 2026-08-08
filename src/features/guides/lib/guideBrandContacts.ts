import type { GuideBrandSocialLink } from "../types/GuideBrandSettings";
import { GUIDE_SOCIAL_PLATFORM_DEFINITIONS } from "./guideSocialPlatforms";

function shorten(value: string, limit = 32): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}

export function shortenGuideContactText(value: string, limit: number): string {
  return shorten(value, limit);
}

export function getGuideWebsiteLabel(value: string): string {
  try {
    return shorten(new URL(value).hostname.replace(/^www\./i, ""));
  } catch {
    return shorten(value);
  }
}

export function getGuideSocialLabel(link: GuideBrandSocialLink): string {
  if (link.handle) return shorten(link.handle);
  try {
    const url = new URL(link.url);
    const segment = decodeURIComponent(url.pathname.split("/").filter(Boolean).at(-1) ?? "");
    if (segment) return shorten(segment.startsWith("@") ? segment : `@${segment}`);
    return shorten(url.hostname.replace(/^www\./i, ""));
  } catch {
    return shorten(link.url);
  }
}

export function getGuideSocialPlatformLabel(platform: GuideBrandSocialLink["platform"]): string {
  return GUIDE_SOCIAL_PLATFORM_DEFINITIONS[platform].label;
}
