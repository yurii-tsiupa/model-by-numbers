import { Text, View } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";
import type { Locale } from "@/features/i18n/types/Locale";

export function GuidePageFooter({
  pageNumber,
  totalPages,
}: {
  locale?: Locale;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <View style={guidePdfStyles.pageFooter}>
      <Text style={guidePdfStyles.footer}>{pageNumber} / {totalPages}</Text>
    </View>
  );
}
