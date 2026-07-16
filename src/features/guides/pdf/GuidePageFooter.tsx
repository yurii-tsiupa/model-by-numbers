import { Text } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";

export function GuidePageFooter({
  pageNumber: _pageNumber,
}: {
  pageNumber: number;
}) {
  void _pageNumber;
  return (
    <Text fixed style={guidePdfStyles.footer} render={({pageNumber,totalPages})=>`MODEL BY NUMBERS  ·  CLASSIC  ·  ${pageNumber} / ${totalPages}`}/>
  );
}
