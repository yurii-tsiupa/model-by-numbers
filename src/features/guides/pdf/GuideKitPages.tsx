import { StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { GUIDE_KIT_CATEGORY_ORDER, resolveGuideKitItemName } from "../lib/getGuideKitItems";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import type { GuideKitCategory, GuideKitItem } from "../types/GuideKit";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";
import { GUIDE_PDF_PAGE_CAPACITY } from "./resolveGuidePdfPagePlan";

type GuideKitPagesProps = {
  pageNumberStart: number;
  totalPages: number;
  viewModel: GuideViewModel;
};

const styles = StyleSheet.create({
  category: {
    marginBottom: tokens.spacingMd,
  },
  categoryTitle: {
    color: pdfColors.accent,
    fontFamily: tokens.headingFont,
    fontSize: tokens.sizeBody,
    fontWeight: tokens.weightSemibold,
    marginBottom: tokens.spacingXs,
  },
  row: {
    alignItems: "center",
    borderBottomColor: pdfColors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: tokens.borderWidth,
    flexDirection: "row",
    minHeight: 28,
    paddingVertical: tokens.spacingXs,
  },
  swatch: {
    borderColor: pdfColors.border,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    height: 18,
    marginRight: tokens.spacingSm,
    width: 18,
  },
  bullet: {
    backgroundColor: pdfColors.accent,
    borderRadius: 3,
    height: 6,
    marginHorizontal: 6,
    marginRight: 18,
    width: 6,
  },
  code: {
    color: pdfColors.muted,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeCaption,
    marginRight: tokens.spacingSm,
    width: 42,
  },
  name: {
    color: pdfColors.text,
    flex: 1,
    fontSize: tokens.sizeBody,
  },
  quantity: {
    color: pdfColors.muted,
    fontSize: tokens.sizeCaption,
    marginLeft: tokens.spacingSm,
  },
  hex: {
    color: pdfColors.muted,
    fontFamily: tokens.monoFont,
    fontSize: tokens.sizeCaption,
    marginLeft: tokens.spacingSm,
  },
});

const categoryTitleKeys: Record<GuideKitCategory, Parameters<typeof translate>[1]> = {
  paint: "guide.kit.paints",
  brush: "guide.kit.brushes",
  tool: "guide.kit.tools",
  material: "guide.kit.materials",
};

function KitRow({ item, name }: { item: GuideKitItem; name: string }) {
  return (
    <View style={styles.row} wrap={false}>
      {item.colorHex ? <View style={[styles.swatch, { backgroundColor: item.colorHex }]} /> : <View style={styles.bullet} />}
      {item.code ? <Text style={styles.code}>{item.code}</Text> : null}
      <Text style={styles.name}>{name}</Text>
      {item.colorHex ? <Text style={styles.hex}>{item.colorHex.toUpperCase()}</Text> : null}
      {item.quantity ? <Text style={styles.quantity}>{item.quantity}</Text> : null}
    </View>
  );
}

export function GuideKitPages({ pageNumberStart, totalPages, viewModel }: GuideKitPagesProps) {
  const { guide, kitItems, locale } = viewModel;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const pageCount = Math.max(1, Math.ceil(kitItems.length / GUIDE_PDF_PAGE_CAPACITY.kitItems));

  return (
    <>
      {Array.from({ length: pageCount }, (_, pageIndex) => {
        const pageItems = kitItems.slice(pageIndex * GUIDE_PDF_PAGE_CAPACITY.kitItems, (pageIndex + 1) * GUIDE_PDF_PAGE_CAPACITY.kitItems);
        return (
          <GuidePage key={pageIndex} id={pageIndex === 0 ? "kit" : undefined} locale={locale} pageNumber={pageNumberStart + pageIndex} projectName={guide.title} totalPages={totalPages}>
            <GuidePdfEyebrow>{t("guide.kit.eyebrow")}</GuidePdfEyebrow>
            <Text style={guidePdfStyles.pageTitle}>{t("guide.kit.title")}{pageIndex > 0 ? ` (${t("guide.continued")})` : ""}</Text>
            <Text style={guidePdfStyles.sectionDescription}>{t("guide.kit.description")}</Text>
            {GUIDE_KIT_CATEGORY_ORDER.map((category) => {
              const categoryItems = pageItems.filter((item) => item.category === category);
              if (!categoryItems.length) return null;
              return <View key={category} style={styles.category}><Text style={styles.categoryTitle}>{t(categoryTitleKeys[category])}</Text>{categoryItems.map((item) => <KitRow key={item.id} item={item} name={resolveGuideKitItemName(item, t)} />)}</View>;
            })}
          </GuidePage>
        );
      })}
    </>
  );
}
