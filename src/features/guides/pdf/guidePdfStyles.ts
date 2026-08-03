import { StyleSheet } from "@react-pdf/renderer";
import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";

export const pdfColors = {
  background: tokens.paperBackground,
  surface: tokens.surfaceBackground,
  border: tokens.borderColor,
  text: tokens.inkPrimary,
  secondary: tokens.inkSecondary,
  muted: tokens.inkMuted,
  faint: tokens.inkFaint,
};

export const guidePdfStyles = StyleSheet.create({
  page: {
    backgroundColor: pdfColors.background,
    color: pdfColors.text,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeBody,
    lineHeight: tokens.lineHeightBody,
    flexDirection: "column",
  },
  pageHeader: {
    flexShrink: 0,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  pageContent: {
    flexShrink: 0,
    overflow: "hidden",
  },
  pageFooter: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  pageTitle: {
    fontFamily: tokens.headingFont,
    fontSize: tokens.sizeH1,
    fontWeight: tokens.weightBold,
    lineHeight: tokens.lineHeightHeading,
    marginBottom: tokens.spacingSm,
  },
  eyebrow: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: tokens.radiusPill,
    flexDirection: "row",
    marginBottom: tokens.spacingSm,
    paddingHorizontal: tokens.spacingSm,
    paddingVertical: tokens.spacingXs,
  },
  eyebrowDot: {
    borderRadius: tokens.radiusPill,
    height: tokens.spacingXs,
    marginRight: tokens.spacingXs,
    width: tokens.spacingXs,
  },
  eyebrowText: {
    fontFamily: tokens.eyebrowFont,
    fontSize: tokens.sizeEyebrow,
    fontWeight: tokens.weightSemibold,
    letterSpacing: 0,
  },
  sectionDescription: {
    color: pdfColors.muted,
    fontSize: tokens.sizeBody,
    marginBottom: tokens.spacingLg,
  },
  card: {
    backgroundColor: pdfColors.surface,
    borderColor: pdfColors.border,
    borderRadius: tokens.radiusCard,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    padding: tokens.spacingMd,
  },
  label: {
    color: pdfColors.muted,
    fontSize: tokens.sizeCaption,
    marginBottom: tokens.spacingXs,
  },
  value: {
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightBold,
  },
  footer: {
    color: pdfColors.muted,
    fontFamily: tokens.monoFont,
    fontSize: 7,
    lineHeight: 1,
    textAlign: "right",
    width: "100%",
  },
  header: {
    color: pdfColors.faint,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeCaption,
    textAlign: "left",
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: pdfColors.surface,
    borderColor: pdfColors.border,
    borderRadius: tokens.radiusCard,
    borderStyle: "dashed",
    borderWidth: tokens.borderWidth,
    color: pdfColors.muted,
    justifyContent: "center",
  },
});
