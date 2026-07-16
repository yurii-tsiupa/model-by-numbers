export type AssemblyStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  partIds: string[];
  createdAt: string;
  updatedAt: string;
  imageKey: string | null;
  imageCapturedAt: string | null;
  imageContentVersion: number | null;
  contentVersion: number;
};

export type CreateAssemblyStepInput = Pick<AssemblyStep, "title" | "description" | "partIds">;
export type UpdateAssemblyStepInput = Partial<CreateAssemblyStepInput>;
