export type ModelPart = {
  id: string;
  meshUuid: string;
  name: string;
  index: number;
  visible: boolean;

  color: string | null;
  originalColor: string | null;
};