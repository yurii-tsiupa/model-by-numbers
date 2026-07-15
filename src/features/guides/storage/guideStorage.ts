import type { GeneratedGuide, SaveGeneratedGuideInput } from "../types/GeneratedGuide";

export interface GuideStorage {
  getByProjectId(projectId: string): Promise<GeneratedGuide[]>;
  getById(guideId: string): Promise<GeneratedGuide | null>;
  getAll(): Promise<GeneratedGuide[]>;
  save(input: SaveGeneratedGuideInput): Promise<GeneratedGuide>;
  delete(guideId: string): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
}
