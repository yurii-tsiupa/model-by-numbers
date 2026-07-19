export type ProjectThumbnail = {
  projectId: string;
  blob: Blob;
  mimeType: "image/webp" | "image/png";
  width: number;
  height: number;
  baseColor?: string;
  createdAt: Date;
  updatedAt: Date;
};
