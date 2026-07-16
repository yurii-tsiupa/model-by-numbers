import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

import type {
  CreateProjectInput,
  Project
} from "../types/Project";
import { deleteModelFile, uploadModel } from "./storage.service";
import { ProjectPart } from "../types/ProjectPart";
import { PaletteColor } from "../types/PaletteColor";

type CreateProjectParams = CreateProjectInput & {
  onUploadProgress?: (progress: number) => void;
};

function mapProjectDocument(
  snapshot: DocumentSnapshot<DocumentData>,
): Project {
  const data = snapshot.data();

  if (!data) {
    throw new Error("Project document does not exist.");
  }

  return {
    id: snapshot.id,
    userId: data.userId,

    name: data.name,
    description: data.description ?? "",

    modelUrl: data.modelUrl ?? null,
    modelStoragePath: data.modelStoragePath ?? null,
    originalFileName: data.originalFileName ?? "",
    originalFileSize: data.originalFileSize ?? 0,
    originalFileType: data.originalFileType ?? "",

    thumbnailUrl: data.thumbnailUrl ?? null,

    status: data.status,

    printerType: data.printerType,
    material: data.material,
    baseColor: data.baseColor,

    parts: Array.isArray(data.parts)
      ? data.parts.map((part: Partial<ProjectPart>) => ({
          id: String(part.id ?? ""),
          name: String(part.name ?? "Unnamed part"),
          visible: part.visible !== false,
          includeInGuide: part.includeInGuide !== false,

          color:
            typeof part.color === "string"
              ? part.color
              : null,

          paletteColorId:
            typeof part.paletteColorId === "string"
              ? part.paletteColorId
              : null,
          explodedOffset:
            part.explodedOffset &&
            Number.isFinite(part.explodedOffset.x) &&
            Number.isFinite(part.explodedOffset.y) &&
            Number.isFinite(part.explodedOffset.z)
              ? {
                  x: part.explodedOffset.x,
                  y: part.explodedOffset.y,
                  z: part.explodedOffset.z,
                }
              : null,
        }))
      : [],
    
    palette: Array.isArray(data.palette)
      ? data.palette
          .map(
            (
              color: Partial<PaletteColor>,
            ): PaletteColor => ({
              id: String(color.id ?? ""),
              number:
                typeof color.number === "number"
                  ? color.number
                  : 0,
              name: String(
                color.name ?? "Unnamed color",
              ),
              hex: String(color.hex ?? "#FFFFFF"),
            }),
          )
          .filter(
            (color: PaletteColor) =>
              Boolean(color.id) &&
              color.number > 0,
          )
          .sort(
            (
              firstColor: PaletteColor,
              secondColor: PaletteColor,
            ) =>
              firstColor.number -
              secondColor.number,
          )
      : [],

    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(),

    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(),
  };
}

export async function getProjects(
  userId: string,
): Promise<Project[]> {
  if (!userId) {
    return [];
  }

  const projectsQuery = query(
    collection(db, "projects"),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(projectsQuery);

  return snapshot.docs
    .map(mapProjectDocument)
    .sort(
      (firstProject, secondProject) =>
        secondProject.createdAt.getTime() -
        firstProject.createdAt.getTime(),
    );
}

export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<Project> {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  if (!userId) {
    throw new Error("Authentication is required.");
  }

  const projectReference = doc(db, "projects", projectId);
  const projectDocument = await getDoc(projectReference);

  if (!projectDocument.exists()) {
    throw new Error("Project not found.");
  }

  const project = mapProjectDocument(projectDocument);

  if (project.userId !== userId) {
    throw new Error(
      "You do not have permission to open this project.",
    );
  }

  return project;
}

export async function createProject({
  userId,
  name,
  description,
  file,
  printerType,
  material,
  baseColor,
  onUploadProgress,
}: CreateProjectParams): Promise<Project> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Project name is required.");
  }

  const projectReference = doc(collection(db, "projects"));
  const projectId = projectReference.id;

  const localModel = await uploadModel({
    userId,
    projectId,
    file,
    onProgress: onUploadProgress,
  });

  await setDoc(projectReference, {
    id: projectId,
    userId,

    name: trimmedName,
    description: description.trim(),

    modelUrl: localModel.modelUrl,
    modelStoragePath: localModel.modelStoragePath,
    originalFileName: localModel.originalFileName,
    originalFileSize: localModel.originalFileSize,
    originalFileType: localModel.originalFileType,

    thumbnailUrl: null,

    status: "draft",

    printerType,
    material,
    baseColor,

    parts: [],
    palette: [],

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const createdDocument = await getDoc(projectReference);

  return mapProjectDocument(createdDocument);
}

export async function deleteProject(
  project: Project,
): Promise<void> {
  await deleteModelFile(project.id);
  await deleteDoc(doc(db, "projects", project.id));
}

export async function saveProjectEditorState({
  projectId,
  userId,
  parts,
  palette,
}: {
  projectId: string;
  userId: string;
  parts: ProjectPart[];
  palette: PaletteColor[];
}): Promise<void> {
  if (!projectId || !userId) {
    throw new Error(
      "Project ID and authenticated user are required.",
    );
  }

  const projectReference = doc(
    db,
    "projects",
    projectId,
  );

  const projectDocument = await getDoc(
    projectReference,
  );

  if (!projectDocument.exists()) {
    throw new Error("Project not found.");
  }

  const projectData = projectDocument.data();

  if (projectData.userId !== userId) {
    throw new Error(
      "You do not have permission to update this project.",
    );
  }

  await updateDoc(projectReference, {
    parts,
    palette,
    updatedAt: serverTimestamp(),
  });
}
