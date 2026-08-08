/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import {
  Image,
  Link,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { GuidePage } from "./GuidePage";
import { formatLocalizedDate,translate } from "@/features/i18n/lib/i18n";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";
import { useGuidePdfDesignTokens } from "./GuidePdfTemplateContext";
import { getGuideSocialLabel, shortenGuideContactText } from "../lib/guideBrandContacts";
import { resolveGuideBrandLogoDimensions, resolveGuideBrandQrPoints } from "../lib/guideBrandLayout";
import type { GuideBrandElementLayout, GuideBrandElementType } from "../types/GuideBrandLayout";
import { GuideBrandLayoutLayer } from "./GuideBrandLayoutZone";
import { GuideLinkIcon, GuideSocialIcon } from "./GuideSocialIcon";

type GuideCoverPageProps = {
  viewModel: GuideViewModel;
  exportDate: Date;
  pageNumber: number;
  templateSettings?: GuideTemplateSettings;
  totalPages: number;
};

const styles = StyleSheet.create({
  content: {
    justifyContent: "space-between",
    position: "relative",
  },
  titleBlock: {
    marginTop: 30,
  },
  branding: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 32,
  },
  brandLogo: {
    height: 32,
    objectFit: "contain",
    width: 80,
  },
  brandName: {
    fontSize: 10,
    fontWeight: 600,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.15,
  },
  subtitle: {
    color: pdfColors.muted,
    fontSize: 15,
    marginTop: 8,
  },
  imageContainer: {
    ...guidePdfStyles.placeholder,
    backgroundColor:"#fafafa",
    borderColor:"#d4d4d4",
    height: 310,
    marginTop: 28,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    objectFit: "contain",
    width: "100%",
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },
  metadataItem: {
    ...guidePdfStyles.card,
    width: "31.8%",
  },
  contactQrFrame: {
    backgroundColor: "#FFFFFF",
    padding: 4,
  },
  contactQr: {
    objectFit: "contain",
  },
  contactDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: { alignItems: "center", flexDirection: "row", marginBottom: 3, marginRight: 6 },
  contactLine: {
    color: pdfColors.muted,
    fontSize: 8,
    marginTop: 3,
    textDecoration: "none",
  },
  contactText: {
    fontSize: 9,
    fontWeight: 600,
  },
  contactCta: {
    fontSize: 8,
    marginTop: 2,
  },
  coverMeta: {
    color: pdfColors.faint,
    fontSize: 8,
    textAlign: "right",
  },
});

export function GuideCoverPage({ viewModel, exportDate, pageNumber, templateSettings, totalPages }: GuideCoverPageProps) {
  const {guide,metrics,targetMode}=viewModel;
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const design = useGuidePdfDesignTokens();
  const branding = templateSettings?.branding;
  const coverImage=guide.images.painted??guide.images.base??guide.images.original??guide.images.numbers;
  const targetLabel=targetMode==="markers"?t("guide.metrics.paintingTargets"):targetMode==="region"?t("guide.metrics.paintedAreas"):t("guide.metrics.modelParts");
  const metadata = [[t("guide.metrics.steps"),String(metrics.stepCount)],[t("guide.usedColors"),String(metrics.usedColorCount)],[targetLabel,String(metrics.targetCount)]].filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()));
  const contact = viewModel.backCoverData;
  const coverSocialLinks = branding?.socialLinks.slice(0, 4) ?? [];
  const coverCustomLinks = branding?.customLinks.slice(0, 3) ?? [];
  const layout = branding?.coverLayout;
  const activeBrandElements = new Set<GuideBrandElementType>([
    ...(branding?.logoUrl ? ["logo" as const] : []),
    ...(branding?.name ? ["brand" as const] : []),
    ...(branding?.ctaText ? ["cta" as const] : []),
    ...(contact?.qrImageUrl ? ["qr" as const] : []),
    ...(coverSocialLinks.length ? ["socialLinks" as const] : []),
    ...(coverCustomLinks.length ? ["customLinks" as const] : []),
  ]);
  const renderBrandElement = (element: GuideBrandElementType, settings: GuideBrandElementLayout) => {
    const textAlign = settings.alignment;
    if (element === "logo" && branding?.logoUrl) {
      const dimensions = resolveGuideBrandLogoDimensions("cover", settings.logoScale, templateSettings?.pageFormat ?? viewModel.pageFormat);
      return <Image src={branding.logoUrl} style={{ ...dimensions, objectFit: "contain" }} />;
    }
    if (element === "qr" && contact?.qrImageUrl) {
      const size = resolveGuideBrandQrPoints("cover", settings.qrScale, templateSettings?.pageFormat ?? viewModel.pageFormat);
      return <View style={styles.contactQrFrame}><Image src={contact.qrImageUrl} style={[styles.contactQr, { height: size, width: size }]} /></View>;
    }
    if (element === "socialLinks") return <View style={[styles.contactDetails, { justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center" }]}>
      {coverSocialLinks.map((link) => <View key={link.id} style={styles.contactItem}><GuideSocialIcon platform={link.platform} /><Link src={link.url} style={[styles.contactLine, { fontFamily: design.bodyFont, marginLeft: 3, marginTop: 0 }]}>{getGuideSocialLabel(link)}</Link></View>)}
    </View>;
    if (element === "customLinks") return <View>
      {coverCustomLinks.map((link) => <View key={link.id} style={styles.contactItem}><GuideLinkIcon /><Link src={link.url} style={[styles.contactLine, { color: design.accentText, fontFamily: design.bodyFont, marginLeft: 3, marginTop: 0, textAlign }]}>{shortenGuideContactText(link.label, 32)}</Link></View>)}
    </View>;
    if (element === "brand") return <View>
      {branding?.name ? <Text style={[styles.contactText, { color: design.accentText, fontFamily: design.bodyFont, textAlign }]}>{shortenGuideContactText(branding.name, 36)}</Text> : null}
    </View>;
    if (element === "cta") return <View>
      {branding?.ctaText ? <Text style={[styles.contactCta, { fontFamily: design.bodyFont, textAlign }]}>{shortenGuideContactText(branding.ctaText, 64)}</Text> : null}
    </View>;
    return null;
  };

  return (
    <GuidePage
      backgroundSectionId="cover"
      id="projectOverview"
      locale={locale}
      pageNumber={pageNumber}
      projectName={guide.title}
      totalPages={totalPages}
      contentStyle={styles.content}
      style={{backgroundColor:templateSettings?.pageBackground??pdfColors.background,color:templateSettings?.textColor??pdfColors.text}}
    >
      <View>
        <View style={[styles.titleBlock, { marginTop: 0 }]}>
          <Text style={[styles.title, { fontFamily: design.headingFont }]}>{guide.title}</Text>
          <Text style={[styles.subtitle, { fontFamily: design.bodyFont }]}>{t("guide.paintingGuide")}</Text>
        </View>

        <View style={styles.imageContainer}>
          {coverImage ? (
            <Image src={coverImage} style={styles.image} />
          ) : (
            <Text>{t("pdf.missingPainted")}</Text>
          )}
        </View>

        <View style={styles.metadata}>
          {metadata.map(([label, value]) => (
            <View key={label} style={styles.metadataItem}>
              <Text style={guidePdfStyles.label}>{label}</Text>
              <Text style={guidePdfStyles.value}>{value}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.subtitle,{fontSize:9,marginTop:14,fontFamily:design.bodyFont}]}>{[guide.printerType,guide.material].filter(Boolean).join(" · ")}</Text>
      </View>
      <Text style={styles.coverMeta}>{[guide.author,formatLocalizedDate(exportDate,locale,{day:"numeric",month:"long",year:"numeric"}),t(`language.${locale}`)].filter(Boolean).join(" · ")}</Text>
      {layout ? <GuideBrandLayoutLayer activeElements={activeBrandElements} layout={layout} page="cover" pageFormat={templateSettings?.pageFormat ?? viewModel.pageFormat} renderElement={renderBrandElement} /> : null}
    </GuidePage>
  );
}
