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

type GuideProjectPageProps = {
  guide: ModelGuide;
};

const styles = StyleSheet.create({
  description: {
    color: pdfColors.muted,
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 24,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detail: {
    ...guidePdfStyles.card,
    minHeight: 62,
    width: "48.7%",
  },
  colorValue: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  swatch: {
    borderColor: "#d4d4d4",
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    height: 18,
    width: 18,
  },
});

export function GuideProjectPage({
  guide,
}: GuideProjectPageProps) {
  const details = [
    ["Author", guide.author],
    ["Printer type", guide.printerType.toUpperCase()],
    ["Material", guide.material.toUpperCase()],
    ["Visible parts", String(guide.partsCount)],
    ["Used colors", String(guide.colorsCount)],
  ];

  return (
    <Page size="A4" orientation="portrait" style={guidePdfStyles.page}>
      <Text style={guidePdfStyles.eyebrow}>Project reference</Text>
      <Text style={guidePdfStyles.pageTitle}>{guide.title}</Text>

      {guide.description ? (
        <Text style={styles.description}>{guide.description}</Text>
      ) : (
        <Text style={guidePdfStyles.sectionDescription}>
          No project description was provided.
        </Text>
      )}

      <View style={styles.details}>
        {details.map(([label, value]) => (
          <View key={label} style={styles.detail}>
            <Text style={guidePdfStyles.label}>{label}</Text>
            <Text style={guidePdfStyles.value}>{value}</Text>
          </View>
        ))}

        <View style={styles.detail}>
          <Text style={guidePdfStyles.label}>Base color</Text>
          <View style={styles.colorValue}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: guide.baseColor },
              ]}
            />
            <Text style={guidePdfStyles.value}>
              {guide.baseColor.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      <GuidePageFooter pageNumber={2} />
    </Page>
  );
}
