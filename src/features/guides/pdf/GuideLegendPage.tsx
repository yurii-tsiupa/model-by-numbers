import { StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { getGuideLegendItems, type GuideLegendItem } from "../lib/getGuideLegendItems";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";
import { useGuidePdfDesignTokens } from "./GuidePdfTemplateContext";
import type { GuideDesignTokens } from "../design/guideDesignTokens";

type GuideLegendPageProps = {
  pageNumber: number;
  totalPages: number;
  viewModel: GuideViewModel;
};

const styles = StyleSheet.create({
  intro: {
    color: pdfColors.muted,
    fontSize: tokens.sizeBody,
    lineHeight: tokens.lineHeightBody,
    marginBottom: tokens.spacingMd,
    maxWidth: 450,
  },
  list: {
    borderTopColor: pdfColors.border,
    borderTopStyle: "solid",
    borderTopWidth: tokens.borderWidth,
  },
  row: {
    alignItems: "center",
    borderBottomColor: pdfColors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: tokens.borderWidth,
    flexDirection: "row",
    minHeight: 82,
    paddingVertical: tokens.spacingSm,
  },
  sample: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    marginRight: tokens.spacingMd,
    width: 72,
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: tokens.headingFont,
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightSemibold,
    marginBottom: tokens.spacingXs,
  },
  itemDescription: {
    color: pdfColors.muted,
    fontSize: tokens.sizeCaption,
    lineHeight: 1.45,
  },
  stepBadge: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  stepNumber: {
    fontFamily: tokens.monoFont,
    fontSize: 11,
    fontWeight: tokens.weightSemibold,
  },
  markerGroup: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  marker: {
    alignItems: "center",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  markerStem: {
    height: 10,
    marginLeft: 10,
    width: 2,
  },
  markerNumber: {
    fontFamily: tokens.monoFont,
    fontSize: 8,
    fontWeight: tokens.weightSemibold,
  },
  region: {
    borderRadius: 13,
    borderStyle: "solid",
    borderWidth: 2,
    height: 34,
    width: 48,
  },
  parts: {
    flexDirection: "row",
    gap: 4,
  },
  partPrimary: {
    borderRadius: 6,
    height: 38,
    width: 25,
  },
  partSecondary: {
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    height: 29,
    marginTop: 9,
    width: 25,
  },
  swatch: {
    borderColor: pdfColors.border,
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    height: 38,
    width: 38,
  },
  viewFrame: {
    alignItems: "center",
    borderRadius: 7,
    borderStyle: "solid",
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 50,
  },
  viewSubject: {
    borderRadius: 9,
    borderStyle: "solid",
    borderWidth: 2,
    height: 18,
    width: 18,
  },
});

function LegendSample({ item, design }: { item: GuideLegendItem; design: GuideDesignTokens }) {
  if (item.id === "step") {
    return <View style={[styles.stepBadge, { backgroundColor: design.accentColor }]}><Text style={[styles.stepNumber, { color: design.accentForeground }]}>01</Text></View>;
  }
  if (item.id === "marker") {
    return <View style={styles.markerGroup}>{[1, 1].map((number, index) => <View key={index}><View style={[styles.marker, { backgroundColor: design.accentColor }]}><Text style={[styles.markerNumber, { color: design.accentForeground }]}>{number}</Text></View><View style={[styles.markerStem, { backgroundColor: design.accentColor }]} /></View>)}</View>;
  }
  if (item.id === "region") {
    return <View style={[styles.region, { backgroundColor: design.accentSoft, borderColor: design.accentColor }]} />;
  }
  if (item.id === "part") {
    return <View style={styles.parts}><View style={[styles.partPrimary, { backgroundColor: design.accentColor }]} /><View style={[styles.partSecondary, { backgroundColor: design.accentSoft, borderColor: design.accentColor }]} /></View>;
  }
  if (item.id === "color") {
    return <View style={[styles.swatch, { backgroundColor: design.accentColor }]} />;
  }
  return <View style={[styles.viewFrame, { borderColor: design.accentColor }]}><View style={[styles.viewSubject, { borderColor: design.accentColor }]} /></View>;
}

export function GuideLegendPage({ pageNumber, totalPages, viewModel }: GuideLegendPageProps) {
  const { guide, locale, targetMode } = viewModel;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const items = getGuideLegendItems(targetMode);
  const design = useGuidePdfDesignTokens();

  return (
    <GuidePage id="legend" locale={locale} pageNumber={pageNumber} projectName={guide.title} totalPages={totalPages}>
      <GuidePdfEyebrow>{t("guide.legend.eyebrow")}</GuidePdfEyebrow>
      <Text style={guidePdfStyles.pageTitle}>{t("guide.legend.title")}</Text>
      <Text style={styles.intro}>{t("guide.legend.intro")}</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row} wrap={false}>
            <View style={styles.sample}><LegendSample item={item} design={design} /></View>
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.itemDescription}>{t(item.descriptionKey)}</Text>
            </View>
          </View>
        ))}
      </View>
    </GuidePage>
  );
}
