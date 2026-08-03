import { StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";

const styles = StyleSheet.create({
  list: {
    borderTopColor: pdfColors.border,
    borderTopStyle: "solid",
    borderTopWidth: tokens.borderWidth,
    marginTop: tokens.spacingLg,
  },
  item: {
    borderBottomColor: pdfColors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: tokens.borderWidth,
    flexDirection: "row",
    paddingVertical: tokens.spacingMd,
  },
  number: {
    color: pdfColors.accent,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeCaption,
    width: 34,
  },
  copy: { flexGrow: 1 },
  title: {
    color: pdfColors.text,
    fontFamily: tokens.headingFont,
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightSemibold,
  },
  description: {
    color: pdfColors.muted,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeCaption,
    lineHeight: 1.5,
    marginTop: tokens.spacingXs,
  },
});

export function GuideTroubleshootingPage({
  pageNumber,
  totalPages,
  viewModel,
}: {
  pageNumber: number;
  totalPages: number;
  viewModel: GuideViewModel;
}) {
  const { guide, locale, troubleshootingData } = viewModel;
  if (!troubleshootingData) return null;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <GuidePage id="troubleshooting" locale={locale} pageNumber={pageNumber} projectName={guide.title} totalPages={totalPages} wrap={false}>
      <GuidePdfEyebrow>{t("guide.troubleshooting.eyebrow")}</GuidePdfEyebrow>
      <Text style={guidePdfStyles.pageTitle}>{t("guide.troubleshooting.title")}</Text>
      <Text style={guidePdfStyles.sectionDescription}>{t("guide.troubleshooting.description")}</Text>
      <View style={styles.list}>
        {troubleshootingData.items.map((item, itemIndex) => (
          <View key={item.id} style={styles.item} wrap={false}>
            <Text style={styles.number}>{String(itemIndex + 1).padStart(2, "0")}</Text>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.source === "default" ? t(item.titleKey) : item.title}</Text>
              <Text style={styles.description}>{item.source === "default" ? t(item.descriptionKey) : item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </GuidePage>
  );
}
