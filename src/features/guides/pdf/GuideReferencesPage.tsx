/* eslint-disable jsx-a11y/alt-text */
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { GuideReferenceImage } from "../types/ModelGuide";
import { guidePdfStyles, pdfColors } from "./guidePdfStyles";
import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";
import { GuidePage } from "./GuidePage";
import { GuidePdfEyebrow } from "./GuidePdfEyebrow";
import { GUIDE_PDF_PAGE_CAPACITY } from "./resolveGuidePdfPagePlan";

const styles = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 }, card: { backgroundColor: "#fafafa", borderColor: pdfColors.border, borderRadius: 9, borderStyle: "solid", borderWidth: 1, padding: 7, width: "48%" }, image: { height: 184, objectFit: "contain", backgroundColor: "#f5f5f5" }, largeImage:{height:360}, caption: { paddingHorizontal: 3, paddingBottom: 3 }, name: { fontSize: 9, fontWeight: 600, marginTop: 6 }, type: { fontSize: 8, color: pdfColors.muted, marginTop: 2, textTransform: "capitalize" } });
const REFERENCES_PER_PAGE=GUIDE_PDF_PAGE_CAPACITY.references;

export function GuideReferencesPage({ references, locale, pageNumberStart, projectName, totalPages }: { references: GuideReferenceImage[]; locale: Locale; pageNumberStart: number; projectName: string; totalPages: number }) {
  const t = (key: Parameters<typeof translate>[1], values?: Parameters<typeof translate>[2]) => translate(locale, key, values);
  const pageCount=Math.max(1,Math.ceil(references.length/REFERENCES_PER_PAGE));
  return <>{Array.from({length:pageCount},(_,pageIndex)=>{
    const pageReferences=references.slice(pageIndex*REFERENCES_PER_PAGE,(pageIndex+1)*REFERENCES_PER_PAGE);
    return <GuidePage key={pageIndex} id={pageIndex === 0 ? "references" : undefined} locale={locale} pageNumber={pageNumberStart+pageIndex} projectName={projectName} totalPages={totalPages}>
      <GuidePdfEyebrow>{t("guide.source")}</GuidePdfEyebrow><Text style={guidePdfStyles.pageTitle}>{t("guide.references")}{pageIndex>0?` (${t("guide.continued")})`:""}</Text>{pageIndex===0?<Text style={guidePdfStyles.sectionDescription}>{t("pdf.referencesHelp")}</Text>:null}
      <View style={styles.grid}>{pageReferences.map((reference,index) => {const large=pageReferences.length===1||(pageReferences.length===3&&index===0),caption=reference.caption?.trim();return <View key={reference.id} style={[styles.card,large?{width:"100%"}:{}]}>{reference.dataUrl ? <Image src={reference.dataUrl} style={[styles.image,large?styles.largeImage:{}]}/> : <View style={[styles.image, guidePdfStyles.placeholder]}><Text>{t("pdf.missingView")}</Text></View>}{caption?<View style={styles.caption}><Text style={styles.name}>{caption}</Text></View>:null}</View>})}</View>
    </GuidePage>;
  })}</>;
}
