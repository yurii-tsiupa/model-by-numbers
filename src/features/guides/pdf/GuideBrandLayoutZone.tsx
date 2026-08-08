import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

import { groupGuideBrandContentByPosition, resolveGuideBrandElementPosition, resolveGuideBrandPositionAlignment } from "../lib/guideBrandLayout";
import type { GuidePageFormat } from "../types/GuidePageFormat";
import type { GuideBrandElementLayout, GuideBrandElementType, GuideBrandPageLayout } from "../types/GuideBrandLayout";

export function GuideBrandLayoutLayer({ activeElements, layout, page, pageFormat, renderElement }: {
  activeElements: ReadonlySet<GuideBrandElementType>;
  layout: GuideBrandPageLayout;
  page: "cover" | "backCover";
  pageFormat: GuidePageFormat;
  renderElement: (element: GuideBrandElementType, settings: GuideBrandElementLayout) => ReactNode;
}) {
  const independentElements = (["logo", "qr"] as const).filter((element) => activeElements.has(element));
  const contentGroups = groupGuideBrandContentByPosition(layout, activeElements);
  return <>
    {independentElements.map((element) => {
    const settings = layout[element];
    return <View key={element} style={resolveGuideBrandElementPosition(page, settings.position, pageFormat)}>{renderElement(element, settings)}</View>;
    })}
    {contentGroups.map(({ elements, position }) => {
      const alignment = resolveGuideBrandPositionAlignment(position);
      const alignItems = alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center";
      return <View key={`content-${position}`} style={[resolveGuideBrandElementPosition(page, position, pageFormat), { overflow: "hidden" }]}>
        <View style={{ alignItems, width: "100%" }}>
          {elements.map((element, index) => <View key={element} style={{ marginTop: index === 0 ? 0 : page === "cover" ? 4 : 6, width: "100%" }}>{renderElement(element, { ...layout[element], alignment })}</View>)}
        </View>
      </View>;
    })}
  </>;
}
