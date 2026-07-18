import { Page } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "@/features/i18n/types/Locale";
import { GuidePageFooter } from "./GuidePageFooter";
import { guidePdfStyles } from "./guidePdfStyles";
import { PDF_PAGE_POINTS } from "./printPageConstants";
import { GuidePageHeader } from "./GuidePageHeader";
import { useGuidePdfTemplate } from "./GuidePdfTemplateContext";

type GuidePageProps = Omit<ComponentProps<typeof Page>, "children" | "size"> & {
  children: ReactNode;
  locale: Locale;
  projectName: string;
  showFooter?: boolean;
};

export function GuidePage({children, locale, projectName, showFooter = true, style, wrap = true, ...props}: GuidePageProps) {
  const template=useGuidePdfTemplate();
  const pageStyle = Array.isArray(style)
    ? [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}, ...style]
    : style
      ? [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}, style]
      : [guidePdfStyles.page, {backgroundColor:template.pageBackground,color:template.textColor}];
  return (
    <Page
      {...props}
      size={{width: PDF_PAGE_POINTS.width, height: PDF_PAGE_POINTS.height}}
      orientation="portrait"
      style={pageStyle}
      wrap={wrap}
    >
      <GuidePageHeader projectName={projectName}/>
      {children}
      {showFooter ? <GuidePageFooter locale={locale}/> : null}
    </Page>
  );
}
