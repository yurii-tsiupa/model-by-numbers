import { Path, Svg } from "@react-pdf/renderer";

import { GUIDE_SOCIAL_PLATFORM_DEFINITIONS } from "../lib/guideSocialPlatforms";
import type { GuideBrandSocialPlatform } from "../types/GuideBrandSettings";

export function GuideSocialIcon({ platform, size = 8 }: { platform: GuideBrandSocialPlatform; size?: number }) {
  return <Svg height={size} viewBox="0 0 24 24" width={size}>{GUIDE_SOCIAL_PLATFORM_DEFINITIONS[platform].paths.map((path) => <Path key={path} d={path} fill="#111111" />)}</Svg>;
}

export function GuideLinkIcon({ size = 8 }: { size?: number }) {
  return <Svg height={size} viewBox="0 0 24 24" width={size}><Path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a4 4 0 1 1 5.7 5.7l-3 3a4 4 0 0 1-5.7 0 1 1 0 0 1 1.4-1.4 2 2 0 0 0 2.9 0l3-3a2 2 0 1 0-2.9-2.9L12 13.4a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4L10 15.4a2 2 0 1 0 2.9 2.9 1 1 0 0 1 1.4 1.4A4 4 0 1 1 8.6 14l3.4-3.4a1 1 0 0 1 1.4 0Z" fill="#111111" /></Svg>;
}
