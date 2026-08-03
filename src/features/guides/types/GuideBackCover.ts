export type GuideBackCover = {
  enabled: boolean;
  brandName?: string | null;
  logoUrl?: string | null;
  headline?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  socialUrl?: string | null;
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
  qrValue: string | null;
  ctaText: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
};
