import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { translate } from "@/features/i18n/lib/i18n";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";

const styles = StyleSheet.create({ list: { marginTop: 12 }, row: { borderBottomColor: pdfColors.border, borderBottomStyle: "solid", borderBottomWidth: 1, paddingBottom: 10, paddingTop: 10 }, link: { color: pdfColors.text, fontSize: 12, textDecoration: "none" }, number: { color: pdfColors.accent, fontSize: 9, marginRight: 12, width: 24 } });

export function GuideTableOfContentsPage({ pageNumber, totalPages, viewModel }: { pageNumber: number; totalPages: number; viewModel: GuideViewModel }) {
  const { locale, sections, guide } = viewModel;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return <GuidePage id="toc" locale={locale} pageNumber={pageNumber} projectName={guide.title} totalPages={totalPages}>
    <GuidePdfEyebrow>{t("guide.cover.document")}</GuidePdfEyebrow>
    <Text style={guidePdfStyles.pageTitle}>{t("guide.navigation.contents")}</Text>
    <View style={styles.list}>{sections.map((section, index) => <View key={section.id} style={styles.row} wrap={false}><Text style={styles.link}><Text style={styles.number}>{String(index + 1).padStart(2, "0")}</Text>{t(section.titleKey)}</Text></View>)}</View>
  </GuidePage>;
}
