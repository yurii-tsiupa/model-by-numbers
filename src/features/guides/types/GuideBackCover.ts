import type { GuideBrandSocialLink } from "./GuideBrandSettings";

export type GuideBackCover = {
  enabled: boolean;
  brandName?: string | null;
  logoUrl?: string | null;
  headline?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  socialUrl?: string | null;
  socialLinks?: GuideBrandSocialLink[];
  qrValue?: string | null;
  ctaText?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
};

export type ResolvedGuideBackCover = {
  enabled: true;
  brandName: string | null;
  logoUrl: string | null;
  headline: string | null;
  description: string | null;
  websiteUrl: string | null;
  socialUrl: string | null;
  socialLinks: GuideBrandSocialLink[];
  qrValue: string | null;
  qrImageUrl?: string | null;
  ctaText: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
};
