import { Page } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "@/features/i18n/types/Locale";
import { GuidePageFooter } from "./GuidePageFooter";
import { guidePdfStyles } from "./guidePdfStyles";
import { PDF_PAGE_POINTS } from "./printPageConstants";

type GuidePageProps = Omit<ComponentProps<typeof Page>, "children" | "size"> & {
  children: ReactNode;
  locale: Locale;
  showFooter?: boolean;
};

export function GuidePage({children, locale, showFooter = true, style, wrap = true, ...props}: GuidePageProps) {
  const pageStyle = Array.isArray(style)
    ? [guidePdfStyles.page, ...style]
    : style
      ? [guidePdfStyles.page, style]
      : guidePdfStyles.page;
  return (
    <Page
      {...props}
      size={{width: PDF_PAGE_POINTS.width, height: PDF_PAGE_POINTS.height}}
      orientation="portrait"
      style={pageStyle}
      wrap={wrap}
    >
      {children}
      {showFooter ? <GuidePageFooter locale={locale}/> : null}
    </Page>
  );
}
