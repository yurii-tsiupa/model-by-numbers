export type GuidePaletteColor = {
  id: string;
  number: number;
  name: string;
  hex: string;
  usageCount: number;
};

export type GuidePart = {
  id: string;
  name: string;
  number: number;
  colorNumber: number | null;
  colorName: string | null;
  colorHex: string | null;
  notes: string | null;
};

export type GuideImages = {
  original: string | null;
  base: string | null;
  painted: string | null;
  numbers: string | null;
};
import type { ReferenceImageType } from "@/features/references/types/ReferenceImage";
export type GuideReferenceImage = { id:string; name:string; type:ReferenceImageType; dataUrl:string; width:number; height:number; };

export type ModelGuide = {
  projectId: string;
  title: string;
  description: string;
  author: string;
  printerType: string;
  material: string;
  baseColor: string;
  partsCount: number;
  colorsCount: number;
  palette: GuidePaletteColor[];
  parts: GuidePart[];
  images: GuideImages;
  references?: GuideReferenceImage[];
  generatedAt: Date;
};
