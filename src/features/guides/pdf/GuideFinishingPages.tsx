/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import {
  getGuideFinishingItemTitleKey,
} from "../lib/resolveGuideFinishingData";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";
import { getGuidePdfPageCapacity } from "./resolveGuidePdfPagePlan";
import { useGuidePdfTemplate } from "./GuidePdfTemplateContext";

const styles = StyleSheet.create({
  item: {
    borderBottomColor: pdfColors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: tokens.borderWidth,
    marginTop: tokens.spacingLg,
    paddingBottom: tokens.spacingLg,
  },
  itemHeader: { alignItems: "flex-start", flexDirection: "row" },
  number: {
    color: pdfColors.accent,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeBody,
    width: 32,
  },
  itemCopy: { flexGrow: 1 },
  itemTitle: {
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
  image: {
    backgroundColor: pdfColors.background,
    borderColor: pdfColors.border,
    borderRadius: tokens.radiusCard,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    height: 220,
    marginLeft: 32,
    marginTop: tokens.spacingSm,
    objectFit: "contain",
    width: "94%",
  },
  runningTitle: {
    color: pdfColors.secondary,
    fontFamily: tokens.bodyFont,
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightSemibold,
    marginBottom: tokens.spacingMd,
  },
});

export function GuideFinishingPages({
  pageNumberStart,
  totalPages,
  viewModel,
}: {
  pageNumberStart: number;
  totalPages: number;
  viewModel: GuideViewModel;
}) {
  const { finishingData, guide, locale } = viewModel;
  const itemsPerPage = getGuidePdfPageCapacity(useGuidePdfTemplate().pageFormat).finishingItems;
  if (!finishingData) return null;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const pages = Array.from(
    { length: Math.ceil(finishingData.items.length / itemsPerPage) },
    (_, pageIndex) => finishingData.items.slice(
      pageIndex * itemsPerPage,
      (pageIndex + 1) * itemsPerPage,
    ),
  );

  return <>{pages.map((items, pageIndex) => (
    <GuidePage
      key={items[0]?.id ?? pageIndex}
      id={pageIndex === 0 ? "finishing" : undefined}
      locale={locale}
      pageNumber={pageNumberStart + pageIndex}
      projectName={guide.title}
      totalPages={totalPages}
      wrap={false}
    >
      {pageIndex === 0 ? <>
        <GuidePdfEyebrow>{t("guide.finishing.eyebrow")}</GuidePdfEyebrow>
        <Text style={guidePdfStyles.pageTitle}>{t("guide.finishing.title")}</Text>
        <Text style={guidePdfStyles.sectionDescription}>{t("guide.finishing.description")}</Text>
      </> : <Text style={styles.runningTitle}>{t("guide.finishing.title")}</Text>}
      {items.map((item, itemIndex) => {
        const title = item.title ?? t(getGuideFinishingItemTitleKey(item.type));
        return <View key={item.id} style={styles.item} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={styles.number}>{String(pageIndex * itemsPerPage + itemIndex + 1).padStart(2, "0")}</Text>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>{title}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            </View>
          </View>
          {item.image ? <Image src={item.image.src} style={styles.image} /> : null}
        </View>;
      })}
    </GuidePage>
  ))}</>;
}
