import type { AssemblyStep } from "@/features/models/types/AssemblyStep";
import type { ModelPart } from "@/features/model-editor/types/ModelPart";
import type { GuideSettings } from "../types/ModelGuide";

export type AssemblyReadinessSeverity = "info" | "warning" | "error";
export type AssemblyReadinessIssueCode = "assembly-disabled" | "no-steps" | "missing-title" | "no-valid-parts" | "missing-part-reference" | "invalid-order" | "duplicate-step-id" | "missing-step-image" | "stale-step-image";
export type AssemblyReadinessIssue = { code: AssemblyReadinessIssueCode; severity: AssemblyReadinessSeverity; stepId: string | null };
export type AssemblyGuideReadiness = { isEnabled: boolean; isReady: boolean; blockingIssues: AssemblyReadinessIssue[]; warnings: AssemblyReadinessIssue[] };

export function getAssemblyGuideReadiness({ settings, assemblySteps, parts }: { settings: GuideSettings; assemblySteps: readonly AssemblyStep[]; parts: readonly ModelPart[]; assemblyImageMetadata?: ReadonlyMap<string, unknown> }): AssemblyGuideReadiness {
  if (!settings.includeAssemblyInstructions) return { isEnabled: false, isReady: true, blockingIssues: [], warnings: [{ code: "assembly-disabled", severity: "info", stepId: null }] };
  const blockingIssues: AssemblyReadinessIssue[] = [];
  const warnings: AssemblyReadinessIssue[] = [];
  if (assemblySteps.length === 0) blockingIssues.push({ code: "no-steps", severity: "error", stepId: null });
  const validPartIds = new Set(parts.map((part) => part.id));
  const stepIds = new Set<string>();
  const orders = new Set<number>();
  for (const [index, step] of assemblySteps.entries()) {
    if (stepIds.has(step.id)) blockingIssues.push({ code: "duplicate-step-id", severity: "error", stepId: step.id });
    if (orders.has(step.order) || step.order !== index + 1) blockingIssues.push({ code: "invalid-order", severity: "error", stepId: step.id });
    if (!step.title.trim()) blockingIssues.push({ code: "missing-title", severity: "error", stepId: step.id });
    const currentParts = step.partIds.filter((id) => validPartIds.has(id));
    if (currentParts.length === 0) blockingIssues.push({ code: "no-valid-parts", severity: "error", stepId: step.id });
    if (currentParts.length !== step.partIds.length) blockingIssues.push({ code: "missing-part-reference", severity: "error", stepId: step.id });
    if (settings.includeAssemblyStepImages) {
      if (!step.imageKey) warnings.push({ code: "missing-step-image", severity: "warning", stepId: step.id });
      else if (step.imageContentVersion !== step.contentVersion) warnings.push({ code: "stale-step-image", severity: "warning", stepId: step.id });
    }
    stepIds.add(step.id); orders.add(step.order);
  }
  return { isEnabled: true, isReady: blockingIssues.length === 0, blockingIssues, warnings };
}
