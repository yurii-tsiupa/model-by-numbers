import {
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ModelGuide } from "../types/ModelGuide";
import { GuidePageFooter } from "./GuidePageFooter";
import { GuidePageHeader } from "./GuidePageHeader";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { translate } from "@/features/i18n/lib/i18n";

type GuideProjectPageProps = {
  guide: ModelGuide;
};

const styles = StyleSheet.create({
  description: {
    color: pdfColors.muted,
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 24,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detail: {
    ...guidePdfStyles.card,
    minHeight: 62,
    width: "48.7%",
  },
  colorValue: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  swatch: {
    borderColor: "#d4d4d4",
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    height: 18,
    width: 18,
  },
});

export function GuideProjectPage({
  guide,
}: GuideProjectPageProps) {
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const details = [
    [t("guide.author"), guide.author],[t("guide.printer"), guide.printerType.toUpperCase()],[t("guide.material"), guide.material.toUpperCase()],[t("guide.visibleParts"), String(guide.partsCount)],[t("guide.usedColors"), String(guide.colorsCount)],
  ];

  return (
    <Page id="project-overview" size="A4" orientation="portrait" style={guidePdfStyles.page}>
      <GuidePageHeader projectName={guide.title}/>
      <Text style={guidePdfStyles.eyebrow}>{t("guide.projectReference")}</Text>
      <Text style={guidePdfStyles.pageTitle}>{guide.title}</Text>

      {guide.description ? (
        <Text style={styles.description}>{guide.description}</Text>
      ) : (
        <Text style={guidePdfStyles.sectionDescription}>
          {t("guide.noDescription")}
        </Text>
      )}

      <View style={styles.details}>
        {details.map(([label, value]) => (
          <View key={label} style={styles.detail}>
            <Text style={guidePdfStyles.label}>{label}</Text>
            <Text style={guidePdfStyles.value}>{value}</Text>
          </View>
        ))}

        <View style={styles.detail}>
          <Text style={guidePdfStyles.label}>{t("guide.baseColor")}</Text>
          <View style={styles.colorValue}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: guide.baseColor },
              ]}
            />
            <Text style={guidePdfStyles.value}>
              {guide.baseColor.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      <GuidePageFooter locale={locale}/>
    </Page>
  );
}
