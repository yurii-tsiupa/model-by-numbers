/* eslint-disable jsx-a11y/alt-text -- React PDF Image is decorative and does not accept DOM alt attributes. */
import { Image, Link, Text, View } from "@react-pdf/renderer";

import { getGuideSocialLabel } from "../lib/guideBrandContacts";
import type { GuideBrandContentElementType, GuideBrandElementPosition } from "../types/GuideBrandLayout";
import type { GuidePageGeometry } from "./printPageConstants";
import { GuideSocialIcon } from "./GuideSocialIcon";
import { useGuidePdfBrandAssets } from "./GuidePdfBrandAssetsContext";
import { useGuidePdfDesignTokens, useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import type { GuideContentSectionId } from "../config/guideSectionRegistry";
import { GUIDE_BRAND_CONTENT_QR_SCALE_MAX, GUIDE_BRAND_CONTENT_QR_SCALE_MIN, GUIDE_BRAND_LOGO_SCALE_MAX, GUIDE_BRAND_LOGO_SCALE_MIN } from "../lib/guideBrandLayout";

const ELEMENT_ORDER: readonly GuideBrandContentElementType[] = ["logo", "brand", "socialLinks", "qr"];

function slotStyle(position: GuideBrandElementPosition, geometry: GuidePageGeometry) {
  const [vertical, horizontal] = position === "center"
    ? ["center", "center"]
    : position.split("-");
  const width = geometry.contentWidth / 3;
  const height = (geometry.contentRegionHeight - geometry.contentPaddingTop - geometry.contentPaddingBottom) / 3;
  const column = horizontal === "left" ? 0 : horizontal === "right" ? 2 : 1;
  const row = vertical === "top" ? 0 : vertical === "bottom" ? 2 : 1;
  const alignItems = horizontal === "left" ? "flex-start" as const : horizontal === "right" ? "flex-end" as const : "center" as const;
  const justifyContent = vertical === "top" ? "flex-start" as const : vertical === "bottom" ? "flex-end" as const : "center" as const;
  return {
    alignItems,
    height,
    justifyContent,
    left: geometry.paddingLeft + column * width,
    overflow: "hidden" as const,
    position: "absolute" as const,
    top: geometry.headerHeight + geometry.contentPaddingTop + row * height,
    width,
  };
}

export function GuideContentPageBranding({ geometry, sectionId }: { geometry: GuidePageGeometry; sectionId: GuideContentSectionId }) {
  const template = useGuidePdfTemplate();
  const design = useGuidePdfDesignTokens();
  const { qrImageUrl } = useGuidePdfBrandAssets();
  const branding = template.branding;
  const contentLayout = branding.contentPagesLayout.sections?.[sectionId] ?? branding.contentPagesLayout;
  if (!branding.enabled) return null;

  const configured = new Set<GuideBrandContentElementType>();
  if (branding.logoUrl) configured.add("logo");
  if (branding.name) configured.add("brand");
  if (branding.socialLinks.length) configured.add("socialLinks");
  if (qrImageUrl && branding.qrValue) configured.add("qr");

  const groups = new Map<GuideBrandElementPosition, GuideBrandContentElementType[]>();
  for (const element of ELEMENT_ORDER) {
    const settings = contentLayout[element];
    if (!settings.visible || !configured.has(element)) continue;
    groups.set(settings.position, [...(groups.get(settings.position) ?? []), element]);
  }

  return <>
    {[...groups.entries()].map(([position, elements]) => {
      const alignment = position.endsWith("left") ? "left" : position.endsWith("right") ? "right" : "center";
      const slotWidth = geometry.contentWidth / 3;
      const slotHeight = (geometry.contentRegionHeight - geometry.contentPaddingTop - geometry.contentPaddingBottom) / 3;
      return <View fixed key={position} style={slotStyle(position, geometry)}>
        {elements.map((element, index) => { const settings = contentLayout[element]; const logoScale = Math.min(GUIDE_BRAND_LOGO_SCALE_MAX, Math.max(GUIDE_BRAND_LOGO_SCALE_MIN, settings.logoScale)) / 100; const qrScale = Math.min(GUIDE_BRAND_CONTENT_QR_SCALE_MAX, Math.max(GUIDE_BRAND_CONTENT_QR_SCALE_MIN, settings.qrScale)) / 100; const logoWidth = Math.min(44 * logoScale, slotWidth); const logoHeight = Math.min(18 * logoScale, slotHeight); const qrSize = Math.min(42 * qrScale, slotWidth - 6, slotHeight - 6); return <View key={element} style={{ alignItems: alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center", marginTop: index ? 3 : 0, maxWidth: "100%" }}>
          {element === "logo" && branding.logoUrl ? <Image src={branding.logoUrl} style={{ height: logoHeight, objectFit: "contain", width: logoWidth }} /> : null}
          {element === "brand" && branding.name ? <Text style={{ color: design.inkPrimary, fontFamily: design.headingFont, fontSize: 6.5, fontWeight: 500, textAlign: alignment }}>{branding.name}</Text> : null}
          {element === "socialLinks" ? <View style={{ alignItems: alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center" }}>{branding.socialLinks.slice(0, 3).map((link) => <View key={link.id} style={{ alignItems: "center", flexDirection: "row", marginTop: 1.5 }}><GuideSocialIcon platform={link.platform} size={5.5}/><Link src={link.url} style={{ color: design.inkMuted, fontFamily: design.bodyFont, fontSize: 5, marginLeft: 2, textDecoration: "none" }}>{getGuideSocialLabel(link)}</Link></View>)}</View> : null}
          {element === "qr" && qrImageUrl ? <View style={{ backgroundColor: "#FFFFFF", padding: 3 }}><Image src={qrImageUrl} style={{ height: qrSize, width: qrSize }}/></View> : null}
        </View>;})}
      </View>;
    })}
  </>;
}
