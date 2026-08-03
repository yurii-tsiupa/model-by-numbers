import { Text, View } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";
import type { Locale } from "@/features/i18n/types/Locale";
import type { GuidePageGeometry } from "./printPageConstants";
import { useGuidePdfDesignTokens } from "./GuidePdfTemplateContext";

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
  const design = useGuidePdfDesignTokens();
  return (
    <View style={[guidePdfStyles.pageFooter, { height: geometry.footerHeight, paddingLeft: geometry.paddingLeft, paddingRight: geometry.paddingRight }]}>
      <Text style={[guidePdfStyles.footer, { fontFamily: design.monoFont }]}>{pageNumber} / {totalPages}</Text>
    </View>
  );
}
