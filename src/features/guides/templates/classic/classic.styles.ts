import type { CSSProperties } from "react";

import { defaultGuideDesignTokens as tokens } from "../../design/guideDesignTokens";

export const classicPreviewStyles = {
  section: "scroll-mt-24",
  eyebrow: "inline-flex items-center",
  eyebrowDot: "shrink-0",
  title: "mt-5",
  description: "mt-3 max-w-3xl leading-6",
  card: "overflow-hidden border",
} as const;

export const classicPreviewInlineStyles = {
  eyebrow: {
    backgroundColor: tokens.accentSoft,
    borderRadius: tokens.radiusPill,
    color: tokens.accentColor,
    fontFamily: tokens.eyebrowFont,
    fontSize: tokens.sizeEyebrow,
    fontWeight: tokens.weightSemibold,
    gap: tokens.spacingXs,
    letterSpacing: 0,
    padding: `${tokens.spacingXs}px ${tokens.spacingSm}px`,
    textTransform: "none",
  },
  eyebrowDot: {
    backgroundColor: tokens.accentColor,
    borderRadius: tokens.radiusPill,
    height: tokens.spacingXs,
    width: tokens.spacingXs,
  },
  title: {
    color: tokens.inkPrimary,
    fontFamily: tokens.headingFont,
    fontSize: tokens.sizeH1,
    fontWeight: tokens.weightSemibold,
    lineHeight: tokens.lineHeightHeading,
  },
  description: {
    color: tokens.inkMuted,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeBody,
    lineHeight: tokens.lineHeightBody,
  },
  card: {
    backgroundColor: tokens.paperBackground,
    borderColor: tokens.borderColor,
    borderRadius: tokens.radiusCard,
    borderWidth: tokens.borderWidth,
  },
  paintingPreviewFrame: {
    borderColor: tokens.borderColor,
    borderRadius: tokens.radiusCard,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    overflow: "hidden",
    position: "relative",
  },
} satisfies Record<string, CSSProperties>;
