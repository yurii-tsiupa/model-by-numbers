import { Document, Font } from "@react-pdf/renderer";
import { GuideCoverPage } from "../../pdf/GuideCoverPage";
import { GuideModelViewsPage } from "../../pdf/GuideModelViewsPage";
import { GuidePalettePage } from "../../pdf/GuidePalettePage";
import { GuidePartsPage } from "../../pdf/GuidePartsPage";
import { GuideProjectPage } from "../../pdf/GuideProjectPage";
import { GuideReferencesPage } from "../../pdf/GuideReferencesPage";
import type { ModelGuide } from "../../types/ModelGuide";

Font.register({family:"Roboto",fonts:[{src:"/fonts/roboto-cyrillic-400-normal.woff",fontWeight:400},{src:"/fonts/roboto-cyrillic-700-normal.woff",fontWeight:700}]});
export function ClassicGuideDocument({guide}:{guide:ModelGuide}) {return <Document title={guide.title} author={guide.author} creator="Model by Numbers"><GuideCoverPage guide={guide}/><GuideProjectPage guide={guide}/><GuideModelViewsPage guide={guide}/>{(guide.references?.length??0)>0?<GuideReferencesPage references={guide.references??[]} locale={guide.locale??"en"}/>:null}<GuidePalettePage guide={guide}/><GuidePartsPage guide={guide}/></Document>}
