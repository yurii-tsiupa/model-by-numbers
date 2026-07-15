import {
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ModelGuide } from "../types/ModelGuide";
import { GuidePageFooter } from "./GuidePageFooter";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";

type GuidePartsPageProps = {
  guide: ModelGuide;
};

const COLORS_PER_PAGE = 12;
const PARTS_PER_PAGE = 10;

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
}: GuidePartsPageProps) {
  const palettePageCount = Math.max(
    1,
    Math.ceil(guide.palette.length / COLORS_PER_PAGE),
  );
  const firstPartsPageNumber = 4 + palettePageCount;
  const pageCount = Math.max(
    1,
    Math.ceil(guide.parts.length / PARTS_PER_PAGE),
  );

  return (
    <>
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          orientation="portrait"
          style={guidePdfStyles.page}
        >
          <Text style={guidePdfStyles.eyebrow}>Step reference</Text>
          <Text style={guidePdfStyles.pageTitle}>
            Parts{pageIndex > 0 ? " (continued)" : ""}
          </Text>
          <Text style={guidePdfStyles.sectionDescription}>
            Paint each visible part using its assigned palette color.
          </Text>

          <View style={styles.list}>
            {guide.parts
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
                        <Text style={styles.unassigned}>Unassigned</Text>
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
          <GuidePageFooter
            pageNumber={firstPartsPageNumber + pageIndex}
          />
        </Page>
      ))}
    </>
  );
}
