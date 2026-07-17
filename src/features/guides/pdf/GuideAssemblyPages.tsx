/* eslint-disable jsx-a11y/alt-text */
import {Image,StyleSheet,Text,View} from "@react-pdf/renderer";
import type {ModelGuide} from "../types/ModelGuide";
import {translate} from "@/features/i18n/lib/i18n";
import {guidePdfStyles,pdfColors} from "./guidePdfStyles";
import {getGuideSettings} from "../lib/guideSettings";
import {GuidePage} from "./GuidePage";
import {PrintKeepTogether} from "./PrintKeepTogether";
import {PrintSectionStart} from "./PrintSectionStart";

const styles=StyleSheet.create({card:{borderColor:pdfColors.border,borderRadius:10,borderWidth:1,borderStyle:"solid",padding:14,marginBottom:14},step:{fontSize:9,color:pdfColors.accent,fontWeight:700},title:{fontSize:15,fontWeight:700,marginTop:4},description:{fontSize:9,color:pdfColors.muted,marginTop:6},image:{height:250,objectFit:"contain",backgroundColor:pdfColors.surface,marginTop:12,maxWidth:"100%",width:"100%"},parts:{flexDirection:"row",flexWrap:"wrap",gap:5,marginTop:10},part:{fontSize:8,backgroundColor:pdfColors.surface,padding:5}});
const ASSEMBLY_IMAGE_PRESENCE_POINTS=270;

export function GuideAssemblyPages({guide}:{guide:ModelGuide}) {
  const settings=getGuideSettings(guide),locale=guide.locale??"en";
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  return <GuidePage id="assembly" locale={locale}>
    <PrintSectionStart><Text style={guidePdfStyles.eyebrow}>{t("guide.assembly.eyebrow")}</Text><Text style={guidePdfStyles.pageTitle}>{t("guide.assembly.title")}</Text><Text style={guidePdfStyles.sectionDescription}>{t("guide.assembly.description")}</Text></PrintSectionStart>
    {guide.assemblySteps?.map(step=><View key={step.id} style={styles.card}>
      <PrintSectionStart firstBlockHeight={settings.includeAssemblyStepImages?ASSEMBLY_IMAGE_PRESENCE_POINTS:undefined}><Text style={styles.step}>{t("guide.assembly.step",{number:String(step.order).padStart(2,"0")})}</Text><Text style={styles.title}>{step.title}</Text>{step.description?<Text style={styles.description}>{step.description}</Text>:null}</PrintSectionStart>
      {settings.includeAssemblyStepImages?<PrintKeepTogether>{step.image?<Image src={step.image} style={styles.image}/>:<View style={[styles.image,guidePdfStyles.placeholder]}><Text>{t("guide.assembly.imageMissing")}</Text></View>}</PrintKeepTogether>:null}
      <View style={styles.parts}>{step.parts.map(part=><PrintKeepTogether key={part.id}><Text style={styles.part}>{String(part.number).padStart(2,"0")} — {part.name}</Text></PrintKeepTogether>)}</View>
    </View>)}
  </GuidePage>;
}
