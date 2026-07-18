import { Text } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";
import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";
import { useGuidePdfTemplate } from "./GuidePdfTemplateContext";

export function GuidePageFooter({
  locale = "en",
}: {
  locale?: Locale;
}) {
  const template=useGuidePdfTemplate();
  const alignment=template.pageNumberPosition==="bottomLeft"?"left":template.pageNumberPosition==="bottomRight"?"right":"center";
  return (
    <Text fixed style={[guidePdfStyles.footer,{textAlign:alignment}]} render={({pageNumber,totalPages})=>template.pageNumberStyle==="numeric"?String(pageNumber):translate(locale,"pdf.footer",{page:pageNumber,total:totalPages})}/>
  );
}
