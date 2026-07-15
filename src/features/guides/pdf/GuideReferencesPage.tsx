/* eslint-disable jsx-a11y/alt-text */
import { Image,Page,Text,View,StyleSheet } from "@react-pdf/renderer";
import type { GuideReferenceImage } from "../types/ModelGuide";
import { guidePdfStyles } from "./guidePdfStyles";
import { GuidePageFooter } from "./GuidePageFooter";
const styles=StyleSheet.create({grid:{display:"flex",flexDirection:"row",flexWrap:"wrap",gap:12},card:{width:"48%",marginBottom:12},image:{height:180,objectFit:"contain",backgroundColor:"#f5f5f5"},name:{fontSize:10,fontWeight:700,marginTop:6},type:{fontSize:8,color:"#737373",textTransform:"capitalize"}});
export function GuideReferencesPage({references}:{references:GuideReferenceImage[]}){return <Page size="A4" style={guidePdfStyles.page} wrap><Text style={guidePdfStyles.eyebrow}>Visual references</Text><Text style={guidePdfStyles.pageTitle}>Reference Images</Text><View style={styles.grid}>{references.map(r=><View key={r.id} style={styles.card} wrap={false}><Image src={r.dataUrl} style={styles.image}/><Text style={styles.name}>{r.name}</Text><Text style={styles.type}>{r.type}</Text></View>)}</View><GuidePageFooter pageNumber={6}/></Page>}
