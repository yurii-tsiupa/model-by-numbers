/* eslint-disable jsx-a11y/alt-text */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ModelGuide } from "../types/ModelGuide";
import { translate } from "@/features/i18n/lib/i18n";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";
import { GuidePage } from "./GuidePage";
import { PrintKeepTogether } from "./PrintKeepTogether";
import { PrintSectionStart } from "./PrintSectionStart";

const styles = StyleSheet.create({ image: { height: 510, maxWidth: "100%", objectFit: "contain", backgroundColor: pdfColors.surface, width: "100%" }, placeholder: { height: 510, alignItems: "center", justifyContent: "center", backgroundColor: pdfColors.surface, width: "100%" }, meta: { marginTop: 12, color: pdfColors.muted } });

export function GuideExplodedPage({ guide }: { guide: ModelGuide }) {
  if (!guide.explodedView) return null;
  const locale = guide.locale ?? "en";
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(locale, key, values);
  return <GuidePage id="exploded-view" locale={locale} projectName={guide.title}>
    <PrintSectionStart><Text style={guidePdfStyles.eyebrow}>{t("guide.visual")}</Text><Text style={guidePdfStyles.pageTitle}>{t("guide.exploded.title")}</Text><Text style={guidePdfStyles.sectionDescription}>{t("guide.exploded.description")}</Text></PrintSectionStart>
    <PrintKeepTogether>{guide.explodedView.image ? <Image src={guide.explodedView.image} style={styles.image}/> : <View style={[styles.placeholder, guidePdfStyles.placeholder]}><Text>{t("guide.exploded.imageMissing")}</Text></View>}<Text style={styles.meta}>{t("guide.exploded.partsCount", { count: guide.explodedView.partsCount })}</Text></PrintKeepTogether>
  </GuidePage>;
}
