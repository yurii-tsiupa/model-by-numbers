/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { pdfColors } from "./guidePdfStyles";

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
    fontFamily: tokens.headingFont,
    fontSize: tokens.sizeH1,
    fontWeight: tokens.weightBold,
    textAlign: "center",
  },
  headline: {
    color: pdfColors.secondary,
    fontFamily: tokens.headingFont,
    fontSize: 15,
    fontWeight: tokens.weightSemibold,
    marginTop: tokens.spacingLg,
    maxWidth: 380,
    textAlign: "center",
  },
  description: {
    color: pdfColors.muted,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeBody,
    lineHeight: tokens.lineHeightBody,
    marginTop: tokens.spacingSm,
    maxWidth: 360,
    textAlign: "center",
  },
  cta: {
    color: pdfColors.accent,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightSemibold,
    marginTop: tokens.spacingXl,
    textAlign: "center",
  },
  destination: {
    color: pdfColors.muted,
    fontFamily: tokens.monoFont,
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
  if (!backCoverData) return null;
  const destination = backCoverData.websiteUrl ?? backCoverData.socialUrl ?? backCoverData.qrValue;
  const accentStyle = backCoverData.accentColor ? { color: backCoverData.accentColor } : undefined;

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
        {backCoverData.brandName ? <Text style={accentStyle ? [styles.brandName, accentStyle] : styles.brandName}>{backCoverData.brandName}</Text> : null}
        {backCoverData.headline ? <Text style={styles.headline}>{backCoverData.headline}</Text> : null}
        {backCoverData.description ? <Text style={styles.description}>{backCoverData.description}</Text> : null}
        {backCoverData.ctaText ? <Text style={accentStyle ? [styles.cta, accentStyle] : styles.cta}>{backCoverData.ctaText}</Text> : null}
        {destination ? <Text style={styles.destination}>{destination}</Text> : null}
      </View>
    </GuidePage>
  );
}
