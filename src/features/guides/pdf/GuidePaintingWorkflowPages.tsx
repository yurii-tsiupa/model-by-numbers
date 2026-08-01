/* eslint-disable jsx-a11y/alt-text -- React PDF Image does not render DOM accessibility attributes. */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import { translate } from "@/features/i18n/lib/i18n";
import { formatPaintingTime } from "@/features/model-editor/lib/paintingWorkflow";

import { getGuideScreenshotLayout } from "../lib/getGuideScreenshotLayout";
import type { GuideViewModel } from "../lib/getGuideViewModel";
import type { GuidePaintingStepViewModel } from "../types/GuidePaintingStep";
import { GuidePage } from "./GuidePage";
import { PrintKeepTogether } from "./PrintKeepTogether";
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
  previews: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginLeft: 34, marginTop: 9 },
  preview: { backgroundColor: pdfColors.surface, height: 126, objectFit: "contain", width: "100%" },
  warning: { color: pdfColors.muted, fontSize: 8, marginLeft: 34, marginTop: 7 },
});

function StepBlock({ step, noColor, missingColor }: { step: GuidePaintingStepViewModel; noColor: string; missingColor: string }) {
  const ready = step.previews.filter((preview) => preview.status === "ready");
  const layout = getGuideScreenshotLayout(ready.length);
  const visible = ready.slice(0, layout.visibleCount);

  return (
    <View style={styles.step}>
      <PrintKeepTogether>
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
      </PrintKeepTogether>

      {visible.length ? (
        <View style={styles.previews}>
          {visible.map((preview, index) =>
            preview.status === "ready" ? (
              <View
                key={preview.id}
                wrap={false}
                style={{
                  width:
                    layout.columns === 1 || (layout.primaryFirst && index === 0)
                      ? "100%"
                      : "48.8%",
                }}
              >
                <Image src={preview.image.src} style={styles.preview} />
              </View>
            ) : null,
          )}
        </View>
      ) : step.previews.some((preview) => preview.status === "unavailable" && preview.reason !== "general") ? (
        <Text style={styles.warning}>—</Text>
      ) : null}
    </View>
  );
}

export function GuidePaintingWorkflowPages({ viewModel }: { viewModel: GuideViewModel }) {
  const { workflowGuide: guide, locale, metrics, paintingSteps } = viewModel;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <GuidePage id="painting-workflow" locale={locale} projectName={guide.title}>
      <PrintSectionStart>
        <Text style={guidePdfStyles.eyebrow}>{t("guide.paintingGuide")}</Text>
        <Text style={guidePdfStyles.pageTitle}>{t("guide.workflow.instructions")}</Text>
        <Text style={styles.intro}>
          {metrics.stepCount} · {metrics.usedColorCount} · {metrics.estimatedTotalTime ? formatPaintingTime(metrics.estimatedTotalTime, locale) : ""}
        </Text>
      </PrintSectionStart>
      {paintingSteps.map((step) => (
        <StepBlock key={step.id} step={step} noColor={t("painting.stage.noColor")} missingColor={t("guide.workflow.missingColor")} />
      ))}
    </GuidePage>
  );
}
