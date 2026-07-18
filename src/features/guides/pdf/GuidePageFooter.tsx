import { Text } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";
import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";

export function GuidePageFooter({
  locale = "en",
}: {
  locale?: Locale;
}) {
  return (
    <Text fixed style={guidePdfStyles.footer} render={({pageNumber,totalPages})=>translate(locale,"pdf.footer",{page:pageNumber,total:totalPages})}/>
  );
}
