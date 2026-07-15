export type ModelPart = {
  id: string;
  meshUuid: string;

  name: string;
  index: number;
  visible: boolean;
  includeInGuide: boolean;

  originalColor: string | null;

  /**
   * Temporary legacy value used before palette generation.
   */
  color: string | null;

  paletteColorId: string | null;
};
