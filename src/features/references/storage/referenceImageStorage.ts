import type { ReferenceImage } from "../types/ReferenceImage";
export type ReferenceChanges = Partial<Pick<ReferenceImage, "name" | "type" | "order" | "includeInGuide">>;
export interface ReferenceImageStorage { getByProjectId(projectId: string): Promise<ReferenceImage[]>; saveMany(references: ReferenceImage[]): Promise<ReferenceImage[]>; update(referenceId: string, changes: ReferenceChanges): Promise<ReferenceImage>; delete(referenceId: string): Promise<void>; deleteByProjectId(projectId: string): Promise<void>; }
