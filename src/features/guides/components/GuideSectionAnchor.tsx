import type { ReactNode } from "react";

import type { GuideContentSectionId } from "../config/guideSectionRegistry";
import { useGuideRenderMode } from "./GuideRenderModeProvider";

type GuideSectionAnchorProps = {
  id: GuideContentSectionId;
  children: ReactNode;
};

export function GuideSectionAnchor({
  id,
  children,
}: GuideSectionAnchorProps) {
  const mode = useGuideRenderMode();
  const isPdf = mode === "pdf";

  return (
    <div
      id={isPdf ? `pdf-${id}` : id}
      data-guide-section={id}
      tabIndex={isPdf ? undefined : -1}
      className="
        guide-chapter
        scroll-mt-24
        outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--accent)]
        focus-visible:ring-offset-4
        focus-visible:ring-offset-[var(--bg)]
      "
    >
      {children}
    </div>
  );
}
