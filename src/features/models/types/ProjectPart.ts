export type ProjectPart = {
  id: string;
  name: string;
  visible: boolean;

  /**
   * Temporary legacy field.
   * Can be removed after all existing projects are migrated.
   */
  color: string | null;

  paletteColorId: string | null;
};