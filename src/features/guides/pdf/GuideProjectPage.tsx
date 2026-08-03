import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { translate } from "@/features/i18n/lib/i18n";

type GuideProjectPageProps = {
  pageNumber: number;
  totalPages: number;
  viewModel: GuideViewModel;
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
  pageNumber,
  totalPages,
  viewModel,
}: GuideProjectPageProps) {
  const {guide,metrics,targetMode}=viewModel;
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const details = [
    [t("guide.author"), guide.author],
    [t("guide.printer"), [guide.printerType,guide.material].filter(Boolean).join(" · ").toUpperCase()],
    [t("guide.metrics.steps"), String(metrics.stepCount)],
    [t("guide.usedColors"), String(metrics.usedColorCount)],
    [targetMode==="markers"?t("guide.metrics.paintingTargets"):targetMode==="region"?t("guide.metrics.paintedAreas"):t("guide.metrics.modelParts"),String(metrics.targetCount)],
  ];

  return (
    <GuidePage locale={locale} pageNumber={pageNumber} projectName={guide.title} totalPages={totalPages}>
      <GuidePdfEyebrow>{t("guide.projectReference")}</GuidePdfEyebrow>
      <Text style={guidePdfStyles.pageTitle}>{guide.title}</Text>

      {guide.description ? (
        <Text style={styles.description}>{guide.description}</Text>
      ) : null}

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
    </GuidePage>
  );
}
