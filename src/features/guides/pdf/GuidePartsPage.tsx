import {
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { GuidePart, ModelGuide } from "../types/ModelGuide";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { GUIDE_PDF_PAGE_CAPACITY } from "./resolveGuidePdfPagePlan";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { translate } from "@/features/i18n/lib/i18n";

type GuidePartsPageProps = {
  guide: ModelGuide;
  pageNumberStart: number;
  parts: readonly GuidePart[];
  totalPages: number;
};

const PARTS_PER_PAGE = GUIDE_PDF_PAGE_CAPACITY.parts;

const styles = StyleSheet.create({
  list: {
    gap: 7,
  },
  row: {
    alignItems: "center",
    backgroundColor: pdfColors.surface,
    borderColor: pdfColors.border,
    borderRadius: 7,
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    padding: 9,
  },
  partNumber: {
    color: pdfColors.accent,
    fontSize: 10,
    fontWeight: 700,
    width: 36,
  },
  partName: {
    flexGrow: 1,
    fontSize: 10,
    fontWeight: 700,
    paddingRight: 12,
  },
  colorDetails: {
    alignItems: "center",
    flexDirection: "row",
    width: 190,
  },
  swatch: {
    borderColor: "#d4d4d4",
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    height: 24,
    marginRight: 8,
    width: 24,
  },
  colorText: {
    flexGrow: 1,
  },
  colorName: {
    fontSize: 9,
    fontWeight: 700,
  },
  colorMeta: {
    color: pdfColors.muted,
    fontSize: 8,
    marginTop: 2,
  },
  unassigned: {
    color: pdfColors.muted,
    fontSize: 9,
  },
});

function formatColorNumber(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function GuidePartsPage({
  guide,
  pageNumberStart,
  parts,
  totalPages,
}: GuidePartsPageProps) {
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  const pageCount = Math.max(
    1,
    Math.ceil(parts.length / PARTS_PER_PAGE),
  );

  return (
    <>
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <GuidePage
          key={pageIndex}
          id={pageIndex===0?"partsOverview":undefined}
          locale={locale}
          pageNumber={pageNumberStart + pageIndex}
          projectName={guide.title}
          totalPages={totalPages}
        >
          <GuidePdfEyebrow>{t("guide.stepReference")}</GuidePdfEyebrow>
          <Text style={guidePdfStyles.pageTitle}>
            {t("guide.parts")}{pageIndex > 0 ? ` (${t("guide.continued")})` : ""}
          </Text>
          <Text style={guidePdfStyles.sectionDescription}>
            {t("pdf.partsHelp")}
          </Text>

          <View style={styles.list}>
            {parts
              .slice(
                pageIndex * PARTS_PER_PAGE,
                (pageIndex + 1) * PARTS_PER_PAGE,
              )
              .map((part) => {
                const isAssigned =
                  part.colorNumber !== null &&
                  part.colorName !== null &&
                  part.colorHex !== null;

                return (
                  <View key={part.id} style={styles.row}>
                    <Text style={styles.partNumber}>{part.number}</Text>
                    <Text style={styles.partName}>{part.name}</Text>
                    <View style={styles.colorDetails}>
                      {isAssigned ? (
                        <>
                          <View
                            style={[
                              styles.swatch,
                              {
                                backgroundColor:
                                  part.colorHex ?? "#ffffff",
                              },
                            ]}
                          />
                          <View style={styles.colorText}>
                            <Text style={styles.colorName}>
                              {formatColorNumber(part.colorNumber ?? 0)} -{" "}
                              {part.colorName}
                            </Text>
                            <Text style={styles.colorMeta}>
                              {(part.colorHex ?? "").toUpperCase()}
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.unassigned}>{t("common.unassigned")}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        </GuidePage>
      ))}
    </>
  );
}
