/* eslint-disable jsx-a11y/alt-text */
import {Image,StyleSheet,Text,View} from "@react-pdf/renderer";
import type {ModelGuide} from "../types/ModelGuide";
import {translate} from "@/features/i18n/lib/i18n";
import {guidePdfStyles,pdfColors} from "./guidePdfStyles";
import {getGuideSettings} from "../lib/guideSettings";
import {GuidePage} from "./GuidePage";
import {GuidePdfEyebrow} from "./GuidePdfEyebrow";
import {PrintKeepTogether} from "./PrintKeepTogether";
import {PrintSectionStart} from "./PrintSectionStart";
import {defaultGuideDesignTokens as tokens} from "../design/guideDesignTokens";

const styles=StyleSheet.create({card:{borderColor:pdfColors.border,borderRadius:tokens.radiusCard,borderWidth:tokens.borderWidth,borderStyle:"solid",padding:tokens.spacingSm,marginBottom:tokens.spacingSm},runningTitle:{color:pdfColors.secondary,fontFamily:tokens.bodyFont,fontSize:tokens.sizeBody,fontWeight:tokens.weightSemibold,marginBottom:tokens.spacingMd},step:{fontSize:9,color:pdfColors.accent,fontWeight:700},title:{fontSize:15,fontWeight:700,marginTop:4},description:{fontSize:9,color:pdfColors.muted,marginTop:6},image:{borderColor:pdfColors.border,borderRadius:tokens.radiusCard,borderStyle:"solid",borderWidth:tokens.borderWidth,height:250,objectFit:"contain",backgroundColor:pdfColors.surface,marginTop:tokens.spacingSm,maxWidth:"100%",width:"100%"},parts:{flexDirection:"row",flexWrap:"wrap",gap:5,marginTop:10},part:{fontSize:8,backgroundColor:pdfColors.surface,padding:5}});
const ASSEMBLY_IMAGE_PRESENCE_POINTS=270;

export function GuideAssemblyPages({guide,pageNumberStart,totalPages}:{guide:ModelGuide;pageNumberStart:number;totalPages:number}) {
  const settings=getGuideSettings(guide),locale=guide.locale??"en";
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  return <>
    {guide.assemblySteps?.map((step,pageIndex)=><GuidePage key={step.id} id={pageIndex===0?"assembly":undefined} locale={locale} pageNumber={pageNumberStart+pageIndex} projectName={guide.title} totalPages={totalPages}>
      <PrintSectionStart fixed={pageIndex > 0}>
        <GuidePdfEyebrow>{t("guide.assembly.eyebrow")}</GuidePdfEyebrow>
        {pageIndex===0?<><Text style={guidePdfStyles.pageTitle}>{t("guide.assembly.title")}</Text><Text style={guidePdfStyles.sectionDescription}>{t("guide.assembly.description")}</Text></>:<Text style={styles.runningTitle}>{t("guide.assembly.title")}</Text>}
      </PrintSectionStart>
      <View style={styles.card}>
        <PrintSectionStart firstBlockHeight={settings.includeAssemblyStepImages?ASSEMBLY_IMAGE_PRESENCE_POINTS:undefined}><Text style={styles.step}>{t("guide.assembly.step",{number:String(step.order).padStart(2,"0")})}</Text><Text style={styles.title}>{step.title}</Text>{step.description?<Text style={styles.description}>{step.description}</Text>:null}</PrintSectionStart>
        {settings.includeAssemblyStepImages&&step.image?<PrintKeepTogether><Image src={step.image} style={styles.image}/></PrintKeepTogether>:null}
        <View style={styles.parts}>{step.parts.map(part=><PrintKeepTogether key={part.id}><Text style={styles.part}>{String(part.number).padStart(2,"0")} — {part.name}</Text></PrintKeepTogether>)}</View>
      </View>
    </GuidePage>)}
  </>;
}
