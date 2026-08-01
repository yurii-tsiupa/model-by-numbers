/* eslint-disable jsx-a11y/alt-text -- React PDF Image has no HTML alt prop. */
import {Image,Page,StyleSheet,Text,View} from "@react-pdf/renderer";
import {translate} from "@/features/i18n/lib/i18n";
import type {GuideViewModel} from "../lib/getGuideViewModel";
import {GuidePageFooter} from "./GuidePageFooter";
import {GuidePageHeader} from "./GuidePageHeader";
import {guidePdfStyles} from "./guidePdfStyles";

const styles=StyleSheet.create({
 views:{gap:22},
 view:{width:"100%"},
 label:{fontSize:10,fontWeight:700,marginBottom:6},
 image:{width:"100%",objectFit:"contain"},
 missing:{color:"#716A79",fontSize:9,paddingVertical:24},
});

export function GuideModelViewsPage({viewModel}:{viewModel:GuideViewModel}){
 const {guide,locale,modelViews}=viewModel,t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
 return <Page id="model-views" size="A4" orientation="portrait" style={guidePdfStyles.page}>
  <GuidePageHeader projectName={guide.title}/>
  <Text style={guidePdfStyles.eyebrow}>{t("guide.visual")}</Text>
  <Text style={guidePdfStyles.pageTitle}>{t("guide.modelOverview")}</Text>
  <Text style={guidePdfStyles.sectionDescription}>{t("guide.modelOverviewDescription")}</Text>
  <View style={styles.views}>{modelViews.map(view=><View key={view.id} style={styles.view} wrap={false}>
   <Text style={styles.label}>{view.caption??t(view.labelKey)}</Text>
   {view.image?<Image src={view.image} style={styles.image}/>:<Text style={styles.missing}>{t("pdf.missingView")}</Text>}
  </View>)}</View>
  <GuidePageFooter locale={locale}/>
 </Page>;
}
