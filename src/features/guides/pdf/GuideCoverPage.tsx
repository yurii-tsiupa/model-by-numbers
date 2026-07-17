import {
  Image,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type { ModelGuide } from "../types/ModelGuide";
import { GuidePageFooter } from "./GuidePageFooter";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { formatLocalizedDate,translate } from "@/features/i18n/lib/i18n";

type GuideCoverPageProps = {
  guide: ModelGuide;
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

export function GuideCoverPage({ guide }: GuideCoverPageProps) {
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const coverImage=guide.images.painted??guide.images.base??guide.images.original??guide.images.numbers;
  const metadata = [
    [t("guide.author"), guide.author],
    [t("guide.parts"), String(guide.partsCount)],
    [t("guide.usedColors"), String(guide.colorsCount)],
    [t("guide.printer"), guide.printerType.toUpperCase()],
    [t("guide.material"), guide.material.toUpperCase()],
    [t("guide.generated"), formatLocalizedDate(guide.generatedAt,locale)],
  ];

  return (
    <Page size="A4" orientation="portrait" style={styles.page}>
      <View>
        <Text style={styles.brand}>{t("pdf.brand")}</Text><View style={styles.accentRule}/>
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
      </View>
      <GuidePageFooter pageNumber={1} locale={locale}/>
    </Page>
  );
}
