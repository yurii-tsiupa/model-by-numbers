export type ProjectThumbnail = {
  projectId: string;
  blob: Blob;
  mimeType: "image/webp" | "image/png";
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
};
