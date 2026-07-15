export type GuidePartInput = {
  id: string;
  name: string;
  visible: boolean;
  includeInGuide?: boolean;
  paletteColorId: string | null;
  index?: number;
};
