/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { resolveGuideFontWeight } from "../design/guideFontRegistry";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { pdfColors } from "./guidePdfStyles";
import { useGuidePdfDesignTokens, useGuidePdfTemplate } from "./GuidePdfTemplateContext";

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 72,
  },
  logo: {
    height: 96,
    marginBottom: tokens.spacingLg,
    objectFit: "contain",
    width: 160,
  },
  brandName: {
    color: pdfColors.text,
    fontSize: tokens.sizeH1,
    textAlign: "center",
  },
  headline: {
    color: pdfColors.secondary,
    fontSize: 15,
    marginTop: tokens.spacingLg,
    maxWidth: 380,
    textAlign: "center",
  },
  description: {
    color: pdfColors.muted,
    fontSize: tokens.sizeBody,
    lineHeight: tokens.lineHeightBody,
    marginTop: tokens.spacingSm,
    maxWidth: 360,
    textAlign: "center",
  },
  cta: {
    fontSize: tokens.sizeBody,
    marginTop: tokens.spacingXl,
    textAlign: "center",
  },
  destination: {
    color: pdfColors.muted,
    fontSize: tokens.sizeCaption,
    marginTop: tokens.spacingSm,
    textAlign: "center",
  },
});

export function GuideBackCoverPage({
  pageNumber,
  totalPages,
  viewModel,
}: {
  pageNumber: number;
  totalPages: number;
  viewModel: GuideViewModel;
}) {
  const { backCoverData, guide, locale } = viewModel;
  const design = useGuidePdfDesignTokens();
  const template = useGuidePdfTemplate();
  if (!backCoverData) return null;
  const destination = backCoverData.websiteUrl ?? backCoverData.socialUrl ?? backCoverData.qrValue;
  const accentStyle = backCoverData.accentColor ? { color: backCoverData.accentColor } : undefined;
  const brandNameStyle = {
    fontFamily: design.headingFont,
    fontWeight: resolveGuideFontWeight(template.headingFont, tokens.weightBold),
  };
  const headlineStyle = {
    fontFamily: design.headingFont,
    fontWeight: resolveGuideFontWeight(template.headingFont, tokens.weightSemibold),
  };
  const descriptionStyle = {
    fontFamily: design.bodyFont,
    fontWeight: resolveGuideFontWeight(template.bodyFont, 400),
  };
  const ctaStyle = {
    fontFamily: design.bodyFont,
    fontWeight: resolveGuideFontWeight(template.bodyFont, tokens.weightSemibold),
  };
  const destinationStyle = {
    fontFamily: design.monoFont,
    fontWeight: resolveGuideFontWeight(template.monoFont, 400),
  };

  return (
    <GuidePage
      id="backCover"
      locale={locale}
      pageNumber={pageNumber}
      projectName={guide.title}
      totalPages={totalPages}
      contentStyle={styles.content}
      wrap={false}
    >
      <View style={{ alignItems: "center" }}>
        {backCoverData.logoUrl ? <Image src={backCoverData.logoUrl} style={styles.logo} /> : null}
        {backCoverData.brandName ? <Text style={[styles.brandName, brandNameStyle, accentStyle ?? {}]}>{backCoverData.brandName}</Text> : null}
        {backCoverData.headline ? <Text style={[styles.headline, headlineStyle]}>{backCoverData.headline}</Text> : null}
        {backCoverData.description ? <Text style={[styles.description, descriptionStyle]}>{backCoverData.description}</Text> : null}
        {backCoverData.ctaText ? <Text style={[styles.cta, ctaStyle, accentStyle ?? { color: design.accentText }]}>{backCoverData.ctaText}</Text> : null}
        {destination ? <Text style={[styles.destination, destinationStyle]}>{destination}</Text> : null}
      </View>
    </GuidePage>
  );
}
