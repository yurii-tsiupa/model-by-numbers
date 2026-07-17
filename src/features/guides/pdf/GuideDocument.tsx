import { Document, Font } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

Font.register({family:"Roboto",fonts:[{src:"/fonts/roboto-cyrillic-400-normal.woff",fontWeight:400},{src:"/fonts/roboto-cyrillic-700-normal.woff",fontWeight:700}]});

type GuideDocumentProps = Omit<ComponentProps<typeof Document>, "children"> & {children: ReactNode};

export function GuideDocument({children, ...props}: GuideDocumentProps) {
  return <Document {...props}>{children}</Document>;
}
