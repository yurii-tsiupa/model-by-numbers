export type Vector3Like = { x: number; y: number; z: number };

export type PaintMarker = {
  id: string;
  number: number;
  name: string;
  colorId: string | null;
  position: Vector3Like;
  normal: Vector3Like | null;
  camera: { position: Vector3Like; target: Vector3Like; zoom?: number };
  createdAt: number;
  updatedAt: number;
};

export type CreatePaintMarkerInput = Pick<PaintMarker, "name" | "position" | "normal" | "camera">;
