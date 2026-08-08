/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import {
  Image,
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

  return (
    <GuidePage
      id="projectOverview"
      locale={locale}
      pageNumber={pageNumber}
      projectName={guide.title}
      totalPages={totalPages}
      contentStyle={styles.content}
      style={{backgroundColor:templateSettings?.pageBackground??pdfColors.background,color:templateSettings?.textColor??pdfColors.text}}
    >
      <View>
        {branding?.name || branding?.logoUrl ? (
          <View style={styles.branding}>
            {branding.logoUrl ? <Image src={branding.logoUrl} style={styles.brandLogo} /> : null}
            {branding.name ? <Text style={[styles.brandName, { color: design.accentText, fontFamily: design.bodyFont }]}>{branding.name}</Text> : null}
          </View>
        ) : null}
        <View style={branding?.name || branding?.logoUrl ? styles.titleBlock : [styles.titleBlock, { marginTop: 0 }]}>
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
    </GuidePage>
  );
}
