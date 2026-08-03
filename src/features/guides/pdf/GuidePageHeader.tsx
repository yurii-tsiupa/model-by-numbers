import { Text } from "@react-pdf/renderer";
import { guidePdfStyles } from "./guidePdfStyles";
import { useGuidePdfDesignTokens } from "./GuidePdfTemplateContext";

export function GuidePageHeader({ projectName }: { projectName: string }) {
  const design = useGuidePdfDesignTokens();
  if (!projectName.trim()) return null;
  return <Text style={[guidePdfStyles.header, { fontFamily: design.monoFont }]}>{projectName}</Text>;
}
