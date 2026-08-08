/* eslint-disable jsx-a11y/alt-text -- React PDF Image is decorative and does not accept DOM alt attributes. */
import { Image, Page, View } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "@/features/i18n/types/Locale";
import { GuidePageFooter } from "./GuidePageFooter";
import { guidePdfStyles } from "./guidePdfStyles";
import { DEFAULT_GUIDE_PAGE_FORMAT } from "../types/GuidePageFormat";
import { getGuidePageGeometry, getGuidePdfPageSize } from "./printPageConstants";
import { GuidePageHeader } from "./GuidePageHeader";
import { useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import { useGuidePdfRenderMode } from "./GuidePdfRenderModeContext";
import { resolveGuidePdfBackground } from "../lib/resolveGuidePdfBackground";
import type { GuidePdfSectionId } from "../config/guideSectionRegistry";
import type { GuidePdfBackgroundTarget } from "../types/GuidePdfBackground";

type GuidePageProps = Omit<ComponentProps<typeof Page>, "children" | "size"> & {
  backgroundSectionId?: Exclude<GuidePdfBackgroundTarget, "all">;
  children: ReactNode;
  locale: Locale;
  pageNumber: number;
  projectName: string;
  showFooter?: boolean;
  totalPages: number;
  contentStyle?: ComponentProps<typeof View>["style"];
};

export function GuidePage({backgroundSectionId, children, id, locale, pageNumber, projectName, showFooter = true, totalPages, contentStyle, style, wrap = false, ...props}: GuidePageProps) {
  const template=useGuidePdfTemplate();
  const renderMode=useGuidePdfRenderMode();
  const pageFormat=template.pageFormat ?? DEFAULT_GUIDE_PAGE_FORMAT;
  const geometry=getGuidePageGeometry(pageFormat);
  const background=resolveGuidePdfBackground(backgroundSectionId ?? id as GuidePdfSectionId | undefined,template.backgroundItems);
  const pageStyle = Array.isArray(style)
    ? [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}, ...style]
    : style
      ? [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}, style]
      : [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}];
  const horizontalPadding = { paddingLeft: geometry.paddingLeft, paddingRight: geometry.paddingRight };
  const contentGeometry = { height: geometry.contentRegionHeight, paddingBottom: geometry.contentPaddingBottom, paddingTop: geometry.contentPaddingTop, ...horizontalPadding };
  const contentStyles = Array.isArray(contentStyle)
    ? [guidePdfStyles.pageContent, contentGeometry, ...contentStyle]
    : contentStyle
      ? [guidePdfStyles.pageContent, contentGeometry, contentStyle]
      : [guidePdfStyles.pageContent, contentGeometry];
  return (
    <Page
      {...props}
      id={id}
      size={getGuidePdfPageSize(pageFormat)}
      orientation="portrait"
      style={pageStyle}
      wrap={wrap}
    >
      {background?.imageUrl ? <Image fixed src={background.imageUrl} style={{ height: geometry.pageHeight, left: 0, objectFit: "cover", objectPosition: "center", opacity: background.opacity / 100, position: "absolute", top: 0, width: geometry.pageWidth }} /> : null}
      <View style={[guidePdfStyles.pageHeader, { height: geometry.headerHeight, ...horizontalPadding }]}><GuidePageHeader projectName={projectName}/></View>
      <View style={contentStyles}>{children}</View>
      {showFooter && renderMode === "export" ? <GuidePageFooter locale={locale} pageNumber={pageNumber} totalPages={totalPages} geometry={geometry}/> : <View style={[guidePdfStyles.pageFooter, { height: geometry.footerHeight, ...horizontalPadding }]}/>}
    </Page>
  );
}
