import type { ReactNode } from "react";
import type { GuideSectionId } from "../lib/getGuideViewModel";

export function GuideSectionAnchor({id,children}:{id:GuideSectionId;children:ReactNode}){
  return <div id={id} data-guide-section={id} tabIndex={-1} className="guide-chapter scroll-mt-24 outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950">{children}</div>;
}
