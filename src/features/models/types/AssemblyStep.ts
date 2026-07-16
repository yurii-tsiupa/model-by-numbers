export type AssemblyStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  partIds: string[];
  createdAt: string;
  updatedAt: string;
  imageKey: string | null;
};

export type CreateAssemblyStepInput = Pick<AssemblyStep, "title" | "description" | "partIds">;
export type UpdateAssemblyStepInput = Partial<CreateAssemblyStepInput>;
