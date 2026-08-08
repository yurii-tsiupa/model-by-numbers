import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { GuideViewModel } from "../lib/getGuideViewModel";
import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { isLightGuideColor } from "../design/isLightGuideColor";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { getGuidePdfPageCapacity } from "./resolveGuidePdfPagePlan";
import { useGuidePdfDesignTokens, useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { formatCount, translate } from "@/features/i18n/lib/i18n";
import { formatGuideColorCode } from "../lib/getGuideKitItems";

type GuidePalettePageProps = {
  pageNumberStart: number;
  totalPages: number;
  viewModel: GuideViewModel;
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacingSm,
  },
  card: {
    backgroundColor: pdfColors.background,
    borderColor: pdfColors.border,
    borderRadius: tokens.radiusCard,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    overflow: "hidden",
    width: "48%",
  },
  swatch: {
    height: 60,
    width: "100%",
  },
  lightSwatch: {
    borderColor: pdfColors.border,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
  },
  content: {
    padding: tokens.spacingSm,
  },
  name: {
    color: pdfColors.text,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightSemibold,
  },
  details: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: tokens.spacingXs,
  },
  hex: {
    color: pdfColors.muted,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeCaption,
  },
  usage: {
    borderRadius: tokens.radiusPill,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeCaption,
    paddingHorizontal: tokens.spacingSm,
    paddingVertical: tokens.spacingXs,
  },
});

export function GuidePalettePage({
  pageNumberStart,
  totalPages,
  viewModel,
}: GuidePalettePageProps) {
  const {guide,usedPalette}=viewModel;
  const colorsPerPage = getGuidePdfPageCapacity(useGuidePdfTemplate().pageFormat).paletteColors;
  const design = useGuidePdfDesignTokens();
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  const pageCount = Math.max(
    1,
    Math.ceil(usedPalette.length / colorsPerPage),
  );

  return (
    <>
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <GuidePage
          backgroundSectionId="palette"
          key={pageIndex}
          id={pageIndex===0?"palette":undefined}
          locale={locale}
          pageNumber={pageNumberStart + pageIndex}
          projectName={guide.title}
          totalPages={totalPages}
        >
          <GuidePdfEyebrow>{t("guide.paintReference")}</GuidePdfEyebrow>
          <Text style={guidePdfStyles.pageTitle}>
            {t("guide.palette")}{pageIndex > 0 ? ` (${t("guide.continued")})` : ""}
          </Text>
          <Text style={guidePdfStyles.sectionDescription}>
            {t("pdf.paletteHelp",{count:usedPalette.length})}
          </Text>

          <View style={styles.grid}>
            {usedPalette
              .slice(
                pageIndex * colorsPerPage,
                (pageIndex + 1) * colorsPerPage,
              )
              .map((color) => (
                <View key={color.id} style={styles.card} wrap={false}>
                  <View
                    style={[
                      styles.swatch,
                      isLightGuideColor(color.hex) ? styles.lightSwatch : {},
                      { backgroundColor: color.hex },
                    ]}
                  />
                  <View style={styles.content}>
                    <Text style={[styles.name, { fontFamily: design.bodyFont }]}>{formatGuideColorCode(color.number)} · {color.name}</Text>
                    <View style={styles.details}>
                      <Text style={[styles.hex, { fontFamily: design.monoFont }]}>{color.hex.toUpperCase()}</Text>
                      <Text style={[styles.usage, { backgroundColor: design.accentSoft, color: design.accentText, fontFamily: design.monoFont }]}>{formatCount(locale,color.usageCount,"step")}</Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </GuidePage>
      ))}
    </>
  );
}
