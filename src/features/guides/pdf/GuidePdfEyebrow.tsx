import { Text, View } from "@react-pdf/renderer";

import { guidePdfStyles } from "./guidePdfStyles";

export function GuidePdfEyebrow({ children }: { children: string }) {
  return (
    <View style={guidePdfStyles.eyebrow}>
      <View style={guidePdfStyles.eyebrowDot} />
      <Text style={guidePdfStyles.eyebrowText}>{children}</Text>
    </View>
  );
}
