/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, Link, StyleSheet, Text, View } from "@react-pdf/renderer";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { resolveGuideFontWeight } from "../design/guideFontRegistry";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { pdfColors } from "./guidePdfStyles";
import { useGuidePdfDesignTokens, useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import { getGuideSocialLabel, getGuideWebsiteLabel } from "../lib/guideBrandContacts";
import { resolveGuideBrandLogoDimensions, resolveGuideBrandQrPoints } from "../lib/guideBrandLayout";
import type { GuideBrandElementLayout, GuideBrandElementType } from "../types/GuideBrandLayout";
import { GuideBrandLayoutLayer } from "./GuideBrandLayoutZone";
import { GuideLinkIcon, GuideSocialIcon } from "./GuideSocialIcon";

const styles = StyleSheet.create({
  content: {
    justifyContent: "space-between",
    paddingBottom: 72,
    position: "relative",
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
    marginTop: tokens.spacingSm,
  },
  socialList: { flexDirection: "row", flexWrap: "wrap" },
  contactItem: { alignItems: "center", flexDirection: "row", marginBottom: 5, marginRight: 8 },
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
  if (!backCoverData || !template.branding.enabled) return null;
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
  const layout = template.branding.backCoverLayout;
  const socialLinks = template.branding.socialLinks.length ? template.branding.socialLinks : backCoverData.socialLinks;
  const customLinks = template.branding.customLinks.length ? template.branding.customLinks : backCoverData.customLinks.length ? backCoverData.customLinks : [
    ...(backCoverData.websiteUrl ? [{ id: "legacy-website", label: getGuideWebsiteLabel(backCoverData.websiteUrl), url: backCoverData.websiteUrl }] : []),
    ...(backCoverData.socialUrl ? [{ id: "legacy-social", label: getGuideWebsiteLabel(backCoverData.socialUrl), url: backCoverData.socialUrl }] : []),
  ];
  const activeBrandElements = new Set<GuideBrandElementType>([
    ...(backCoverData.logoUrl ? ["logo" as const] : []),
    ...(backCoverData.brandName ? ["brand" as const] : []),
    ...(backCoverData.headline || backCoverData.description || backCoverData.ctaText ? ["cta" as const] : []),
    ...(backCoverData.qrImageUrl ? ["qr" as const] : []),
    ...(socialLinks.length ? ["socialLinks" as const] : []),
    ...(customLinks.length || fallbackDestination ? ["customLinks" as const] : []),
  ]);
  const renderBrandElement = (element: GuideBrandElementType, settings: GuideBrandElementLayout) => {
    const textAlign = settings.alignment;
    const alignItems = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";
    if (element === "logo" && backCoverData.logoUrl) {
      const dimensions = resolveGuideBrandLogoDimensions("backCover", settings.logoScale, viewModel.pageFormat);
      return <Image src={backCoverData.logoUrl} style={{ ...dimensions, objectFit: "contain" }} />;
    }
    if (element === "qr" && backCoverData.qrImageUrl) {
      const size = resolveGuideBrandQrPoints("backCover", settings.qrScale, viewModel.pageFormat);
      return <View style={[styles.qrFrame, { marginTop: 0 }]}><Image src={backCoverData.qrImageUrl} style={[styles.qrImage, { height: size, width: size }]} /></View>;
    }
    if (element === "brand") return <View style={{ alignItems }}>
      {backCoverData.brandName ? <Text style={[styles.brandName, brandNameStyle, accentStyle ?? {}, { textAlign }]}>{backCoverData.brandName}</Text> : null}
    </View>;
    if (element === "cta") return <View style={{ alignItems }}>
      {backCoverData.headline ? <Text style={[styles.headline, headlineStyle, { marginTop: 0, textAlign }]}>{backCoverData.headline}</Text> : null}
      {backCoverData.description ? <Text style={[styles.description, descriptionStyle, { textAlign }]}>{backCoverData.description}</Text> : null}
      {backCoverData.ctaText ? <Text style={[styles.cta, ctaStyle, accentStyle ?? { color: design.accentText }, { marginTop: tokens.spacingSm, textAlign }]}>{backCoverData.ctaText}</Text> : null}
    </View>;
    if (element === "socialLinks") return <View style={[styles.socialList, { justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center" }]}>
      {socialLinks.map((link) => <View key={link.id} style={styles.contactItem}><GuideSocialIcon platform={link.platform} size={9} /><Link src={link.url} style={[styles.destination, destinationStyle, { marginLeft: 3, marginTop: 0 }]}>{getGuideSocialLabel(link)}</Link></View>)}
    </View>;
    if (element === "customLinks") return <View style={[styles.contactList, { alignItems, marginTop: 0 }]}>
      {customLinks.map((link) => <View key={link.id} style={styles.contactItem}><GuideLinkIcon size={9} /><Link src={link.url} style={[styles.destination, destinationStyle, { marginLeft: 3, marginTop: 0, textAlign }]}>{link.label}</Link></View>)}
      {fallbackDestination ? <Text style={[styles.destination, destinationStyle, { textAlign }]}>{getGuideWebsiteLabel(fallbackDestination)}</Text> : null}
    </View>;
    return null;
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
      <GuideBrandLayoutLayer activeElements={activeBrandElements} layout={layout} page="backCover" pageFormat={viewModel.pageFormat} renderElement={renderBrandElement} />
    </GuidePage>
  );
}
