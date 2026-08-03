import { Document } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import { registerGuideFonts } from "../design/guideFontRegistry";

registerGuideFonts();

type GuideDocumentProps = Omit<ComponentProps<typeof Document>, "children"> & {children: ReactNode};

export function GuideDocument({children, ...props}: GuideDocumentProps) {
  return <Document {...props}>{children}</Document>;
}
