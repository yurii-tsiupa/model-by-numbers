/* eslint-disable jsx-a11y/alt-text */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import { getGuidePdfPageCapacity } from "./resolveGuidePdfPagePlan";
import { useGuidePdfDesignTokens, useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";
import { PrintKeepTogether } from "./PrintKeepTogether";
import { PrintSectionStart } from "./PrintSectionStart";

const styles = StyleSheet.create({
  card: { borderColor: pdfColors.border, borderRadius: tokens.radiusCard, borderWidth: tokens.borderWidth, borderStyle: "solid", padding: tokens.spacingSm, marginBottom: tokens.spacingSm },
  runningTitle: { color: pdfColors.secondary, fontFamily: tokens.bodyFont, fontSize: tokens.sizeBody, fontWeight: tokens.weightSemibold, marginBottom: tokens.spacingMd },
  step: { fontSize: 9, fontWeight: tokens.weightBold },
  title: { fontSize: 15, fontWeight: tokens.weightBold, marginTop: 4 },
  description: { fontSize: 9, color: pdfColors.muted, marginTop: 6 },
  stepImage: { borderColor: pdfColors.border, borderRadius: tokens.radiusCard, borderStyle: "solid", borderWidth: tokens.borderWidth, height: 250, objectFit: "contain", backgroundColor: pdfColors.background, marginTop: tokens.spacingSm, maxWidth: "100%", width: "100%" },
  parts: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 10 },
  part: { fontSize: 8, backgroundColor: pdfColors.surface, padding: 5 },
  overviewPartsTitle: { fontFamily: tokens.headingFont, fontSize: tokens.sizeBody, fontWeight: tokens.weightSemibold, marginBottom: tokens.spacingXs },
  overviewParts: { borderTopColor: pdfColors.border, borderTopStyle: "solid", borderTopWidth: tokens.borderWidth, flexDirection: "row", flexWrap: "wrap" },
  overviewPart: { borderBottomColor: pdfColors.border, borderBottomStyle: "solid", borderBottomWidth: tokens.borderWidth, flexDirection: "row", paddingVertical: 7, width: "50%" },
  overviewNumber: { fontFamily: tokens.monoFont, fontSize: tokens.sizeCaption, width: 28 },
  overviewName: { color: pdfColors.text, fontSize: tokens.sizeCaption },
  views: { flexDirection: "row", gap: tokens.spacingSm, marginTop: tokens.spacingLg },
  view: { width: "48.8%" },
  viewSingle: { width: "100%" },
  viewImage: { backgroundColor: pdfColors.background, borderColor: pdfColors.border, borderRadius: tokens.radiusCard, borderStyle: "solid", borderWidth: tokens.borderWidth, height: 250, objectFit: "contain", width: "100%" },
  viewLabel: { color: pdfColors.muted, fontSize: tokens.sizeCaption, marginTop: tokens.spacingXs, textAlign: "center" },
});

const ASSEMBLY_IMAGE_PRESENCE_POINTS = 270;

export function GuideAssemblyPages({ pageNumberStart, totalPages, viewModel }: { pageNumberStart: number; totalPages: number; viewModel: GuideViewModel }) {
  const { assemblyData, guide, locale, settings } = viewModel;
  const partsPerPage = getGuidePdfPageCapacity(useGuidePdfTemplate().pageFormat).assemblyParts;
  const design = useGuidePdfDesignTokens();
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(locale, key, values);
  if (!assemblyData) return null;

  if (assemblyData.mode === "steps") {
    return <>{assemblyData.steps.map((step, pageIndex) => <GuidePage key={step.id} id={pageIndex === 0 ? "assembly" : undefined} locale={locale} pageNumber={pageNumberStart + pageIndex} projectName={guide.title} totalPages={totalPages}>
      <PrintSectionStart fixed={pageIndex > 0}>
        <GuidePdfEyebrow>{t("guide.assembly.sectionEyebrow")}</GuidePdfEyebrow>
        {pageIndex === 0 ? <><Text style={guidePdfStyles.pageTitle}>{t("guide.assembly.sectionTitle")}</Text><Text style={guidePdfStyles.sectionDescription}>{t("guide.assembly.description")}</Text></> : <Text style={styles.runningTitle}>{t("guide.assembly.sectionTitle")}</Text>}
      </PrintSectionStart>
      <View style={styles.card}>
        <PrintSectionStart firstBlockHeight={settings.includeAssemblyStepImages ? ASSEMBLY_IMAGE_PRESENCE_POINTS : undefined}><Text style={[styles.step, { color: design.accentText }]}>{t("guide.assembly.step", { number: String(step.order).padStart(2, "0") })}</Text><Text style={styles.title}>{step.title}</Text>{step.description ? <Text style={styles.description}>{step.description}</Text> : null}</PrintSectionStart>
        {settings.includeAssemblyStepImages && step.image ? <PrintKeepTogether><Image src={step.image} style={styles.stepImage} /></PrintKeepTogether> : null}
        <View style={styles.parts}>{step.parts.map((part) => <PrintKeepTogether key={part.id}><Text style={styles.part}>{String(part.number).padStart(2, "0")} — {part.name}</Text></PrintKeepTogether>)}</View>
      </View>
    </GuidePage>)}</>;
  }

  const pageCount = Math.max(1, Math.ceil(assemblyData.parts.length / partsPerPage));
  return <>{Array.from({ length: pageCount }, (_, pageIndex) => {
    const pageParts = assemblyData.parts.slice(pageIndex * partsPerPage, (pageIndex + 1) * partsPerPage);
    return <GuidePage key={pageIndex} id={pageIndex === 0 ? "assembly" : undefined} locale={locale} pageNumber={pageNumberStart + pageIndex} projectName={guide.title} totalPages={totalPages}>
      <GuidePdfEyebrow>{t("guide.assembly.sectionEyebrow")}</GuidePdfEyebrow>
      <Text style={guidePdfStyles.pageTitle}>{t("guide.assembly.sectionTitle")}{pageIndex > 0 ? ` (${t("guide.continued")})` : ""}</Text>
      {pageIndex === 0 ? <Text style={guidePdfStyles.sectionDescription}>{t("guide.assembly.overviewDescription")}</Text> : null}
      <Text style={[styles.overviewPartsTitle, { color: design.accentText }]}>{t("guide.assembly.modelParts")}</Text>
      <View style={styles.overviewParts}>{pageParts.map((part) => <View key={part.id} style={styles.overviewPart} wrap={false}><Text style={[styles.overviewNumber, { color: design.accentText }]}>{String(part.number).padStart(2, "0")}</Text><Text style={styles.overviewName}>{part.name}</Text></View>)}</View>
      {pageIndex === 0 && assemblyData.views.length ? <View style={styles.views}>{assemblyData.views.map((view) => <View key={view.id} style={assemblyData.views.length === 1 ? styles.viewSingle : styles.view}><Image src={view.image} style={styles.viewImage} /><Text style={styles.viewLabel}>{t(view.labelKey)}</Text></View>)}</View> : null}
    </GuidePage>;
  })}</>;
}
