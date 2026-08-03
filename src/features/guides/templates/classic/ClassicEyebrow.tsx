import type { ReactNode } from "react";

import { classicPreviewInlineStyles as inlineStyles, classicPreviewStyles as styles } from "./classic.styles";

export function ClassicEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className={styles.eyebrow} style={inlineStyles.eyebrow}>
      <span className={styles.eyebrowDot} style={inlineStyles.eyebrowDot} aria-hidden="true" />
      {children}
    </span>
  );
}
