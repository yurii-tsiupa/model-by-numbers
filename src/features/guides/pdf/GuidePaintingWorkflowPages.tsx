/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";
import { formatPaintingTime } from "@/features/model-editor/lib/paintingWorkflow";

import { defaultGuideDesignTokens as tokens } from "../design/guideDesignTokens";
import { GUIDE_STEP_LAYOUT } from "../lib/getGuideScreenshotLayout";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import type { ResolvedGuideStepLayout } from "../lib/paginateGuideSteps";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { PrintSectionStart } from "./PrintSectionStart";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";

const styles = StyleSheet.create({
  intro: { color: pdfColors.muted, fontSize: 9, marginBottom: 18 },
  step: {
    borderBottomColor: pdfColors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    marginBottom: 13,
    paddingBottom: 13,
    flexShrink: 0,
  },
  header: { alignItems: "flex-start", flexDirection: "row" },
  number: { color: pdfColors.accent, fontSize: 13, fontWeight: 700, width: 34 },
  heading: { flexGrow: 1 },
  title: { fontSize: 12, fontWeight: 700 },
  target: { color: pdfColors.muted, fontSize: 8, marginTop: 3 },
  color: { alignItems: "center", flexDirection: "row", marginLeft: 8 },
  swatch: {
    borderColor: pdfColors.border,
    borderRadius: 3,
    borderStyle: "solid",
    borderWidth: 1,
    height: 16,
    marginRight: 6,
    width: 16,
  },
  colorText: { color: pdfColors.muted, fontSize: 8, maxWidth: 105 },
  instruction: { fontSize: 9, lineHeight: 1.55, marginLeft: 34, marginTop: 8 },
  previews: { flexDirection: "row", flexWrap: "wrap", marginLeft: 34, marginTop: tokens.spacingSm },
  previewFrame: {
    borderColor: pdfColors.border,
    borderRadius: tokens.radiusCard,
    borderStyle: "solid",
    borderWidth: tokens.borderWidth,
    overflow: "hidden",
    position: "relative",
  },
  preview: { objectFit: "contain" },
  caption: {
    alignItems: "center",
    backgroundColor: pdfColors.accentLight,
    borderRadius: tokens.radiusPill,
    bottom: tokens.spacingXs,
    height: 14,
    justifyContent: "center",
    left: tokens.spacingXs,
    paddingHorizontal: tokens.spacingXs,
    position: "absolute",
  },
  captionText: {
    color: pdfColors.accent,
    fontFamily: tokens.bodyFont,
    fontSize: 8,
    fontWeight: 500,
    lineHeight: 1,
  },
});

function getMeaningfulPreviewLabel(label: string): string | null {
  const trimmed=label.trim();
  if(!trimmed)return null;
  const normalized=trimmed.toLocaleLowerCase();
  if(normalized==="custom view"||normalized==="власний ракурс"||/^custom\s+\d+$/i.test(trimmed))return null;
  return trimmed.length>28?`${trimmed.slice(0,27).trimEnd()}…`:trimmed;
}

function StepBlock({ resolved, noColor, missingColor }: { resolved: ResolvedGuideStepLayout; noColor: string; missingColor: string }) {
  const { step, rows } = resolved;

  return (
    <View style={styles.step} wrap={false}>
      <View>
        <View style={styles.header}>
          <Text style={styles.number}>{String(step.order).padStart(2, "0")}</Text>
          <View style={styles.heading}>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.target}>{step.targetSummary}</Text>
          </View>
          <View style={styles.color}>
            {step.color ? <View style={[styles.swatch, { backgroundColor: step.color.hex }]} /> : null}
            <Text style={styles.colorText}>
              {step.color
                ? `C${String(step.color.number).padStart(2, "0")} · ${step.color.name} · ${step.color.hex.toUpperCase()}`
                : step.colorStatus === "missing" ? missingColor : noColor}
            </Text>
          </View>
        </View>
        {step.instruction ? <Text style={styles.instruction}>{step.instruction}</Text> : null}
      </View>

      {rows.length ? (
        <View style={[styles.previews,{marginLeft:resolved.imageIndent}]}>
          {rows.map((row, rowIndex) => <View key={rowIndex} style={{alignItems:"flex-start",flexDirection:"row",justifyContent:"center",marginBottom:rowIndex<rows.length-1?GUIDE_STEP_LAYOUT.imageGap:0}}>
            {row.images.map((image, imageIndex) => {
              const label=getMeaningfulPreviewLabel(image.preview.label);
              return <View key={image.preview.id} wrap={false} style={{width:image.width,marginRight:imageIndex<row.images.length-1?GUIDE_STEP_LAYOUT.imageGap:0}}>
                <View style={[styles.previewFrame,{height:image.height}]}>
                  <Image src={image.preview.image.src} style={[styles.preview,{height:image.height,width:image.width}]}/>
                  {label?<View style={styles.caption}><Text style={styles.captionText}>{label}</Text></View>:null}
                </View>
              </View>;
            })}
          </View>)}
        </View>
      ) : null}
    </View>
  );
}

export function GuidePaintingWorkflowPages({ pageNumberStart, totalPages, viewModel }: { pageNumberStart: number; totalPages: number; viewModel: GuideViewModel }) {
  const { workflowGuide: guide, locale, metrics, paintingPages } = viewModel;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <>
      {paintingPages.map((page) => (
        <GuidePage key={page.steps[0]?.step.id ?? "painting-empty"} id={page.pageIndex === 0 ? "paintingInstructions" : undefined} locale={locale} pageNumber={pageNumberStart+page.pageIndex} projectName={guide.title} totalPages={totalPages} wrap={false}>
          {page.pageIndex === 0 ? (
            <PrintSectionStart>
              <GuidePdfEyebrow>{t("guide.paintingGuide")}</GuidePdfEyebrow>
              <Text style={guidePdfStyles.pageTitle}>{t("guide.workflow.instructions")}</Text>
              <Text style={styles.intro}>
                {metrics.stepCount} · {metrics.usedColorCount} · {metrics.estimatedTotalTime ? formatPaintingTime(metrics.estimatedTotalTime, locale) : ""}
              </Text>
            </PrintSectionStart>
          ) : <Text style={{ color: pdfColors.secondary, fontSize: tokens.sizeBody, fontWeight: tokens.weightSemibold, marginBottom: tokens.spacingMd }}>{t("guide.workflow.instructions")}</Text>}
          {page.steps.map((resolved) => <StepBlock key={resolved.step.id} resolved={resolved} noColor={t("painting.stage.noColor")} missingColor={t("guide.workflow.missingColor")} />)}
        </GuidePage>
      ))}
    </>
  );
}
