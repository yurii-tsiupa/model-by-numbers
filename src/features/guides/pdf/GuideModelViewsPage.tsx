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
import { translate } from "@/features/i18n/lib/i18n";
import {getGuideSettings} from "../lib/guideSettings";

type GuideModelViewsPageProps = {
  guide: ModelGuide;
};

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
  const locale=guide.locale??"en",settings=getGuideSettings(guide);const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);const enabled:Record<keyof GuideImages,boolean>={original:settings.includeOriginalView,base:settings.includeBaseView,painted:settings.includePaintedView,numbers:settings.includeNumbersView};const modelViews=([{key:"original",label:t("guide.original")},{key:"base",label:t("guide.base")},{key:"painted",label:t("guide.painted")},{key:"numbers",label:t("guide.numbers")}] as Array<{key:keyof GuideImages;label:string}>).filter(view=>enabled[view.key]);
  return (
    <Page size="A4" orientation="portrait" style={guidePdfStyles.page}>
      <Text style={guidePdfStyles.eyebrow}>{t("guide.visual")}</Text>
      <Text style={guidePdfStyles.pageTitle}>{t("guide.modelViews")}</Text>
      <Text style={guidePdfStyles.sectionDescription}>
        {t("pdf.modelViewsHelp")}
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
                  <Text>{t("pdf.missingView")}</Text>
                )}
              </View>
              <Text style={styles.viewLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
      <GuidePageFooter pageNumber={3} locale={locale}/>
    </Page>
  );
}
