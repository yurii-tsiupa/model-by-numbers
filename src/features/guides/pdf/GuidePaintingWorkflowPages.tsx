import {StyleSheet,Text,View} from "@react-pdf/renderer";
import {translate} from "@/features/i18n/lib/i18n";
import {formatPaintingTime} from "@/features/model-editor/lib/paintingWorkflow";
import {getPaintingStageLabel} from "@/features/model-editor/lib/paintingStageLabel";
import type {GuideViewModel} from "../lib/getGuideViewModel";
import {GuidePage} from "./GuidePage";
import {PrintKeepTogether} from "./PrintKeepTogether";
import {PrintSectionStart} from "./PrintSectionStart";
import {guidePdfStyles,pdfColors} from "./guidePdfStyles";

const styles=StyleSheet.create({summary:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:20},summaryItem:{...guidePdfStyles.card,width:"31.5%"},part:{borderColor:pdfColors.border,borderRadius:8,borderStyle:"solid",borderWidth:1,marginBottom:12,padding:12},partHeader:{borderBottomColor:pdfColors.border,borderBottomStyle:"solid",borderBottomWidth:1,marginBottom:8,paddingBottom:8},partTitle:{fontSize:13,fontWeight:700},partMeta:{color:pdfColors.muted,fontSize:8,marginTop:3},stage:{flexDirection:"row",paddingBottom:8,paddingTop:8},stageNumber:{color:pdfColors.accent,fontSize:8,width:25},stageBody:{flexGrow:1},stageTitle:{fontSize:10,fontWeight:700},notes:{fontSize:8,lineHeight:1.5,marginTop:4},swatch:{borderColor:pdfColors.border,borderRadius:3,borderStyle:"solid",borderWidth:1,height:13,marginRight:5,width:13},colorRow:{alignItems:"center",flexDirection:"row",marginTop:4},warning:{color:"#b45309",fontSize:8,marginTop:4}});

export function GuidePaintingWorkflowPages({viewModel}:{viewModel:GuideViewModel}) {
  const {workflowGuide:guide,locale}=viewModel;
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  const summary=guide.paintingSummary;
  const palette=new Map((guide.workflowPalette??[]).map(color=>[color.id,color]));

  return <GuidePage id="painting-workflow" locale={locale}>
    <PrintSectionStart>
      <Text style={guidePdfStyles.eyebrow}>{t("guide.paintingGuide")}</Text>
      <Text style={guidePdfStyles.pageTitle}>{t("guide.workflow.instructions")}</Text>
    </PrintSectionStart>
    {summary?<PrintKeepTogether style={styles.summary}><Summary label={t("guide.workflow.parts")} value={String(guide.parts.length)}/><Summary label={t("guide.workflow.stages")} value={String(summary.stagesCount)}/><Summary label={t("guide.workflow.totalTime")} value={summary.estimatedTimeMinutes?formatPaintingTime(summary.estimatedTimeMinutes,locale):t("guide.workflow.notSpecified")}/></PrintKeepTogether>:null}
    {guide.parts.map((part,index)=>{const workflow=part.paintingWorkflow;return <View key={part.id} style={styles.part}>
      <PrintSectionStart style={styles.partHeader}>
        <Text style={styles.partTitle}>{String(index+1).padStart(2,"0")}  {part.name}</Text>
        {workflow?<Text style={styles.partMeta}>{t("guide.workflow.stageCount",{count:workflow.stages.length})}{workflow.estimatedTimeMinutes?` · ${formatPaintingTime(workflow.estimatedTimeMinutes,locale)}`:""}{workflow.difficulty?` · ${t(`painting.difficulty.${workflow.difficulty}`)}`:""}</Text>:null}
        {workflow?.paintBeforeAssembly?<Text style={styles.warning}>{t("guide.workflow.beforeAssembly")}</Text>:null}
      </PrintSectionStart>
      {workflow?.stages.length?workflow.stages.map(stage=>{const color=stage.paletteColorId?palette.get(stage.paletteColorId):undefined;return <PrintKeepTogether key={stage.id} style={styles.stage}>
        <Text style={styles.stageNumber}>{String(stage.order).padStart(2,"0")}</Text><View style={styles.stageBody}><Text style={styles.stageTitle}>{getPaintingStageLabel(stage,t)}</Text>{color?<View style={styles.colorRow}><View style={[styles.swatch,{backgroundColor:color.hex}]}/><Text style={styles.partMeta}>{color.name} · {color.hex.toUpperCase()}</Text></View>:stage.paletteColorId?<Text style={styles.warning}>{t("guide.workflow.missingColor")}</Text>:null}{stage.recommendedCoats?<Text style={styles.partMeta}>{t("guide.workflow.coats",{count:stage.recommendedCoats})}</Text>:null}{stage.notes?<Text style={styles.notes}>{stage.notes}</Text>:null}</View>
      </PrintKeepTogether>}):<PrintKeepTogether><Text style={styles.warning}>{t("guide.workflow.noWorkflowAvailable")}</Text></PrintKeepTogether>}
      {workflow?.notes?<View><Text style={styles.notes}>{workflow.notes}</Text></View>:null}
    </View>})}
  </GuidePage>;
}

function Summary({label,value}:{label:string;value:string}){return <View style={styles.summaryItem}><Text style={guidePdfStyles.label}>{label}</Text><Text style={guidePdfStyles.value}>{value}</Text></View>}
