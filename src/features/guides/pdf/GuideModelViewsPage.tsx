import {
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type {
  GuideImages,
  ModelGuide,
} from "../types/ModelGuide";
import { GuidePageFooter } from "./GuidePageFooter";
import { guidePdfStyles } from "./guidePdfStyles";

type GuideModelViewsPageProps = {
  guide: ModelGuide;
};

const modelViews: Array<{
  key: keyof GuideImages;
  label: string;
}> = [
  { key: "original", label: "Original Model" },
  { key: "base", label: "Base Model" },
  { key: "painted", label: "Painted Model" },
  { key: "numbers", label: "Numbered Model" },
];

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  viewCard: {
    backgroundColor:"#fafafa",
    borderColor:"#e5e5e5",
    borderRadius:9,
    borderStyle:"solid",
    borderWidth:1,
    padding:7,
    width: "48.7%",
  },
  imageContainer: {
    ...guidePdfStyles.placeholder,
    height: 190,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    objectFit: "contain",
    width: "100%",
  },
  viewLabel: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8,
    paddingBottom:2,
  },
});

export function GuideModelViewsPage({
  guide,
}: GuideModelViewsPageProps) {
  return (
    <Page size="A4" orientation="portrait" style={guidePdfStyles.page}>
      <Text style={guidePdfStyles.eyebrow}>Visual reference</Text>
      <Text style={guidePdfStyles.pageTitle}>Model Views</Text>
      <Text style={guidePdfStyles.sectionDescription}>
        Use these views to compare each stage of the painting process.
      </Text>

      <View style={styles.grid}>
        {modelViews.map(({ key, label }) => {
          const image = guide.images[key];

          return (
            <View key={key} style={styles.viewCard} wrap={false}>
              <View style={styles.imageContainer}>
                {image ? (
                  // React PDF Image does not expose an HTML alt prop.
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={image} style={styles.image} />
                ) : (
                  <Text>Model view not available</Text>
                )}
              </View>
              <Text style={styles.viewLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
      <GuidePageFooter pageNumber={3} />
    </Page>
  );
}
