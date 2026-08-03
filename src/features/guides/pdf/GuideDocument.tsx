import { Document, Font } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

import { defaultGuideDesignTokens } from "../design/guideDesignTokens";

const guideFontSources = {
  heading: {
    500: "/fonts/Unbounded-Medium.ttf",
    600: "/fonts/Unbounded-SemiBold.ttf",
    700: "/fonts/Unbounded-Bold.ttf",
  },
  body: {
    400: "/fonts/Inter-Regular.ttf",
    500: "/fonts/Inter-Medium.ttf",
    600: "/fonts/Inter-SemiBold.ttf",
    700: "/fonts/Inter-Bold.ttf",
  },
  mono: {
    400: "/fonts/JetBrainsMono-Regular.ttf",
    500: "/fonts/JetBrainsMono-Medium.ttf",
  },
} as const;

Font.register({
  family: defaultGuideDesignTokens.headingFont,
  fonts: Object.entries(guideFontSources.heading).map(([fontWeight, src]) => ({ src, fontWeight: Number(fontWeight) })),
});

Font.register({
  family: defaultGuideDesignTokens.bodyFont,
  fonts: Object.entries(guideFontSources.body).map(([fontWeight, src]) => ({ src, fontWeight: Number(fontWeight) })),
});

Font.register({
  family: defaultGuideDesignTokens.monoFont,
  fonts: Object.entries(guideFontSources.mono).map(([fontWeight, src]) => ({ src, fontWeight: Number(fontWeight) })),
});

type GuideDocumentProps = Omit<ComponentProps<typeof Document>, "children"> & {children: ReactNode};

export function GuideDocument({children, ...props}: GuideDocumentProps) {
  return <Document {...props}>{children}</Document>;
}
