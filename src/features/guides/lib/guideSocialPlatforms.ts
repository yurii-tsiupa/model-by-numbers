import type { GuideBrandSocialPlatform } from "../types/GuideBrandSettings";

export const GUIDE_SOCIAL_PLATFORMS: readonly GuideBrandSocialPlatform[] = ["instagram", "tiktok", "telegram", "facebook", "youtube", "x", "linkedin"];

export const GUIDE_SOCIAL_PLATFORM_DEFINITIONS: Record<GuideBrandSocialPlatform, { label: string; paths: readonly string[] }> = {
  instagram: { label: "Instagram", paths: ["M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Z", "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", "M17.5 5.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"] },
  tiktok: { label: "TikTok", paths: ["M14 2h3c.4 2.3 1.8 3.8 4 4.3v3.1a9 9 0 0 1-4-1.2v7.1A6.7 6.7 0 1 1 11.2 8v3.2a3.6 3.6 0 1 0 2.8 3.5V2Z"] },
  telegram: { label: "Telegram", paths: ["M22.5 3.2 19 20.8c-.3 1.3-1.1 1.6-2.2 1l-5.4-4-2.6 2.5c-.3.3-.5.5-1 .5l.4-5.5 10-9c.4-.4-.1-.6-.7-.2L5.1 13.9l-5.3-1.7c-1.2-.4-1.2-1.2.2-1.7L20.8 2.5c1-.4 1.9.2 1.7.7Z"] },
  facebook: { label: "Facebook", paths: ["M15.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H19V2.4c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.6v2.7H9V13h3.1v9h3.4Z"] },
  youtube: { label: "YouTube", paths: ["M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.7V8.3L16 12l-6.4 3.7Z"] },
  x: { label: "X", paths: ["M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.3-8.4L3 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.9h1.7L8.5 4H6.7l11.1 15.9Z"] },
  linkedin: { label: "LinkedIn", paths: ["M4.5 2.5A2.5 2.5 0 1 1 4.5 7a2.5 2.5 0 0 1 0-5ZM2.4 8.5h4.2V22H2.4V8.5ZM9.2 8.5h4v1.8h.1c.6-1.1 2-2.3 4.1-2.3 4.4 0 5.2 2.9 5.2 6.7V22h-4.2v-6.5c0-1.6 0-3.6-2.2-3.6s-2.6 1.7-2.6 3.5V22H9.2V8.5Z"] },
};
