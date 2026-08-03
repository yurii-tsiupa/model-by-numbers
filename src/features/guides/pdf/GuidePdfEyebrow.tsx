import { Text, View } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";
import { useGuidePdfDesignTokens } from "./GuidePdfTemplateContext";

export function GuidePdfEyebrow({ children }: { children: string }) {
  const tokens = useGuidePdfDesignTokens();
  return (
    <View style={[guidePdfStyles.eyebrow, { backgroundColor: tokens.accentSoft, color: tokens.accentText }]}>
      <View style={[guidePdfStyles.eyebrowDot, { backgroundColor: tokens.accentColor }]} />
      <Text style={[guidePdfStyles.eyebrowText, { color: tokens.accentText }]}>{children}</Text>
    </View>
  );
}
