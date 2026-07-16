import type { AssemblyStep } from "@/features/models/types/AssemblyStep";
import type { ModelPart } from "../types/ModelPart";

export type AssemblyValidationIssue = {
  stepId: string;
  code: "missing-title" | "no-parts" | "missing-part-reference" | "invalid-order";
};

export type AssemblyValidationResult = {
  isValid: boolean;
  issues: AssemblyValidationIssue[];
};

export function validateAssemblySteps({ steps, parts }: { steps: readonly AssemblyStep[]; parts: readonly ModelPart[] }): AssemblyValidationResult {
  const issues: AssemblyValidationIssue[] = [];
  const partIds = new Set(parts.map((part) => part.id));
  const ids = new Set<string>();
  const orders = new Set<number>();
  for (const [index, step] of steps.entries()) {
    if (!step.title.trim()) issues.push({ stepId: step.id, code: "missing-title" });
    if (step.partIds.length === 0) issues.push({ stepId: step.id, code: "no-parts" });
    if (step.partIds.some((partId) => !partIds.has(partId))) issues.push({ stepId: step.id, code: "missing-part-reference" });
    if (ids.has(step.id) || orders.has(step.order) || step.order !== index + 1) issues.push({ stepId: step.id, code: "invalid-order" });
    ids.add(step.id);
    orders.add(step.order);
  }
  return { isValid: issues.length === 0, issues };
}
