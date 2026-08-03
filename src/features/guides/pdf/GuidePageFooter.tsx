import { Text, View } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";
import type { Locale } from "@/features/i18n/types/Locale";
import type { GuidePageGeometry } from "./printPageConstants";

export function GuidePageFooter({
  pageNumber,
  totalPages,
  geometry,
}: {
  locale?: Locale;
  pageNumber: number;
  totalPages: number;
  geometry: GuidePageGeometry;
}) {
  return (
    <View style={[guidePdfStyles.pageFooter, { height: geometry.footerHeight, paddingLeft: geometry.paddingLeft, paddingRight: geometry.paddingRight }]}>
      <Text style={guidePdfStyles.footer}>{pageNumber} / {totalPages}</Text>
    </View>
  );
}
