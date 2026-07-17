export type PaintingStageType = "primer" | "base-coat" | "secondary-color" | "wash" | "dry-brush" | "highlight" | "finish" | "custom";
export type PaintingDifficulty = "easy" | "medium" | "hard";
export type PaintingStage = { id: string; order: number; type: PaintingStageType; name: string; paletteColorId: string | null; recommendedCoats: number | null; notes: string; createdAt: string; updatedAt: string };
export type PartPaintingWorkflow = { stages: PaintingStage[]; notes: string; paintBeforeAssembly: boolean; difficulty: PaintingDifficulty | null; estimatedTimeMinutes: number | null };
export type CreatePaintingStageInput = Omit<PaintingStage, "id" | "order" | "createdAt" | "updatedAt">;
export type UpdatePaintingStageInput = Partial<CreatePaintingStageInput>;
export const DEFAULT_PART_PAINTING_WORKFLOW: PartPaintingWorkflow = { stages: [], notes: "", paintBeforeAssembly: false, difficulty: null, estimatedTimeMinutes: null };
