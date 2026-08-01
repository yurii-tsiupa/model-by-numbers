import {
  Image,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { formatLocalizedDate,translate } from "@/features/i18n/lib/i18n";
import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

type GuideCoverPageProps = {
  viewModel: GuideViewModel;
  exportDate: Date;
  templateSettings?: GuideTemplateSettings;
};

const styles = StyleSheet.create({
  page: {
    ...guidePdfStyles.page,
    justifyContent: "space-between",
  },
  brand: {
    color: pdfColors.accent,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  accentRule:{backgroundColor:pdfColors.accent,height:4,marginTop:12,width:48},
  titleBlock: {
    marginTop: 30,
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
});

export function GuideCoverPage({ viewModel, exportDate, templateSettings }: GuideCoverPageProps) {
  const {guide,metrics,targetMode}=viewModel;
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const coverImage=guide.images.painted??guide.images.base??guide.images.original??guide.images.numbers;
  const targetLabel=targetMode==="markers"?t("guide.metrics.paintingTargets"):targetMode==="region"?t("guide.metrics.paintedAreas"):t("guide.metrics.modelParts");
  const metadata = [[t("guide.metrics.steps"),String(metrics.stepCount)],[t("guide.usedColors"),String(metrics.usedColorCount)],[targetLabel,String(metrics.targetCount)]].filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()));

  return (
    <Page size="A4" orientation="portrait" style={[styles.page,{backgroundColor:templateSettings?.pageBackground??pdfColors.background,color:templateSettings?.textColor??pdfColors.text}]}>
      <View>
        <Text style={[styles.brand,{color:templateSettings?.accentColor??pdfColors.accent}]}>{t("pdf.brand")}</Text><View style={[styles.accentRule,{backgroundColor:templateSettings?.accentColor??pdfColors.accent}]}/>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.subtitle}>{t("guide.paintingGuide")}</Text>
        </View>

        <View style={styles.imageContainer}>
          {coverImage ? (
            // React PDF Image does not expose an HTML alt prop.
            // eslint-disable-next-line jsx-a11y/alt-text
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
        <Text style={[styles.subtitle,{fontSize:9,marginTop:14}]}>{[guide.printerType,guide.material].filter(Boolean).join(" · ")}</Text>
      </View>
      <Text style={guidePdfStyles.footer}>{[guide.author,formatLocalizedDate(exportDate,locale,{day:"numeric",month:"long",year:"numeric"}),t(`language.${locale}`)].filter(Boolean).join(" · ")}</Text>
    </Page>
  );
}
