/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, Link, StyleSheet, Text, View } from "@react-pdf/renderer";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { resolveGuideFontWeight } from "../design/guideFontRegistry";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { pdfColors } from "./guidePdfStyles";
import { useGuidePdfDesignTokens, useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import { getGuideSocialLabel, getGuideSocialPlatformLabel, getGuideWebsiteLabel } from "../lib/guideBrandContacts";

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
  qrFrame: {
    backgroundColor: "#FFFFFF",
    marginTop: tokens.spacingLg,
    padding: 8,
  },
  qrImage: {
    height: 126,
    objectFit: "contain",
    width: 126,
  },
  destination: {
    color: pdfColors.muted,
    fontSize: tokens.sizeCaption,
    marginTop: tokens.spacingSm,
    textAlign: "center",
    textDecoration: "none",
  },
  contactList: {
    alignItems: "center",
    gap: 5,
    marginTop: tokens.spacingSm,
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
  const fallbackDestination = !backCoverData.websiteUrl && !backCoverData.socialUrl && !backCoverData.socialLinks.length ? backCoverData.qrValue : null;
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
        {backCoverData.qrImageUrl ? <View style={styles.qrFrame}><Image src={backCoverData.qrImageUrl} style={styles.qrImage} /></View> : null}
        {backCoverData.websiteUrl || backCoverData.socialUrl || backCoverData.socialLinks.length || fallbackDestination ? <View style={styles.contactList}>
          {backCoverData.websiteUrl ? <Link src={backCoverData.websiteUrl} style={[styles.destination, destinationStyle]}>{getGuideWebsiteLabel(backCoverData.websiteUrl)}</Link> : null}
          {backCoverData.socialUrl ? <Link src={backCoverData.socialUrl} style={[styles.destination, destinationStyle]}>{getGuideWebsiteLabel(backCoverData.socialUrl)}</Link> : null}
          {backCoverData.socialLinks.map((link) => <Link key={link.id} src={link.url} style={[styles.destination, destinationStyle]}>{getGuideSocialPlatformLabel(link.type)}  {getGuideSocialLabel(link)}</Link>)}
          {fallbackDestination ? <Text style={[styles.destination, destinationStyle]}>{getGuideWebsiteLabel(fallbackDestination)}</Text> : null}
        </View> : null}
      </View>
    </GuidePage>
  );
}
