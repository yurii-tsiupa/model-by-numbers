import { Page, View } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "@/features/i18n/types/Locale";
import { GuidePageFooter } from "./GuidePageFooter";
import { guidePdfStyles } from "./guidePdfStyles";
import { DEFAULT_GUIDE_PAGE_FORMAT } from "../types/GuidePageFormat";
import { getGuidePdfPageSize } from "./printPageConstants";
import { GuidePageHeader } from "./GuidePageHeader";
import { useGuidePdfTemplate } from "./GuidePdfTemplateContext";
import { useGuidePdfRenderMode } from "./GuidePdfRenderModeContext";

type GuidePageProps = Omit<ComponentProps<typeof Page>, "children" | "size"> & {
  children: ReactNode;
  locale: Locale;
  pageNumber: number;
  projectName: string;
  showFooter?: boolean;
  totalPages: number;
  contentStyle?: ComponentProps<typeof View>["style"];
};

export function GuidePage({children, locale, pageNumber, projectName, showFooter = true, totalPages, contentStyle, style, wrap = false, ...props}: GuidePageProps) {
  const template=useGuidePdfTemplate();
  const renderMode=useGuidePdfRenderMode();
  const pageStyle = Array.isArray(style)
    ? [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}, ...style]
    : style
      ? [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}, style]
      : [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}];
  const contentStyles = Array.isArray(contentStyle)
    ? [guidePdfStyles.pageContent, ...contentStyle]
    : contentStyle
      ? [guidePdfStyles.pageContent, contentStyle]
      : guidePdfStyles.pageContent;
  return (
    <Page
      {...props}
      size={getGuidePdfPageSize(template.pageFormat ?? DEFAULT_GUIDE_PAGE_FORMAT)}
      orientation="portrait"
      style={pageStyle}
      wrap={wrap}
    >
      <View style={guidePdfStyles.pageHeader}><GuidePageHeader projectName={projectName}/></View>
      <View style={contentStyles}>{children}</View>
      {showFooter && renderMode === "export" ? <GuidePageFooter locale={locale} pageNumber={pageNumber} totalPages={totalPages}/> : <View style={guidePdfStyles.pageFooter}/>}
    </Page>
  );
}
