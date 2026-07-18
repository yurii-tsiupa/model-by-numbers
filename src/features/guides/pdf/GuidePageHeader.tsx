import { Text } from "@react-pdf/renderer";
import { guidePdfStyles } from "./guidePdfStyles";

export function GuidePageHeader({ projectName }: { projectName: string }) {
  if (!projectName.trim()) return null;
  return <Text fixed style={guidePdfStyles.header}>{projectName}</Text>;
}
