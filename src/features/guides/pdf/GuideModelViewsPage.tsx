/* eslint-disable jsx-a11y/alt-text -- React PDF Image has no HTML alt prop. */
import {Image,StyleSheet,Text,View} from "@react-pdf/renderer";
import {translate} from "@/features/i18n/lib/i18n";
import type {GuideViewModel} from "../lib/getGuideViewModel";
import {GuidePage} from "./GuidePage";
import {GuidePdfEyebrow} from "./GuidePdfEyebrow";
import {guidePdfStyles} from "./guidePdfStyles";

const styles=StyleSheet.create({
 views:{gap:22},
 view:{width:"100%"},
 label:{fontSize:9,fontWeight:600,marginBottom:4},
 image:{width:"100%",objectFit:"contain"},
 missing:{color:"#716A79",fontSize:9,paddingVertical:24},
});

export function GuideModelViewsPage({pageNumberStart,totalPages,viewModel}:{pageNumberStart:number;totalPages:number;viewModel:GuideViewModel}){
 const {guide,locale,modelViews}=viewModel,t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
 return <>{modelViews.map((view,pageIndex)=><GuidePage key={view.id} id={pageIndex===0?"model-views":undefined} locale={locale} pageNumber={pageNumberStart+pageIndex} projectName={guide.title} totalPages={totalPages}>
  <GuidePdfEyebrow>{t("guide.visual")}</GuidePdfEyebrow>
  <Text style={guidePdfStyles.pageTitle}>{t("guide.modelOverview")}{pageIndex>0?` (${t("guide.continued")})`:""}</Text>
  {pageIndex===0?<Text style={guidePdfStyles.sectionDescription}>{t("guide.modelOverviewDescription")}</Text>:null}
  <View style={styles.views}><View style={styles.view}>
   <Text style={styles.label}>{view.caption??t(view.labelKey)}</Text>
   {view.image?<Image src={view.image} style={styles.image}/>:<Text style={styles.missing}>{t("pdf.missingView")}</Text>}
  </View></View>
 </GuidePage>)}</>;
}
