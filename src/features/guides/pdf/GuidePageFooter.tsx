import { Text } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";

export function GuidePageFooter({
  pageNumber,
}: {
  pageNumber: number;
}) {
  return (
    <Text fixed style={guidePdfStyles.footer}>
      Page {pageNumber}
    </Text>
  );
}
