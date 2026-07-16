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
import type { AssemblyStep } from "../types/AssemblyStep";
import { MAX_EXPLODED_OFFSET } from "@/features/model-editor/lib/exploded/exploded.constants";
import { getModelFileExtension } from "@/features/model-import/lib/getModelFileExtension";

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
    modelFormat: data.modelFormat === "stl" ? "stl" : getModelFileExtension(String(data.originalFileName ?? "")) === "stl" ? "stl" : "glb",
    modelUnits: ["mm", "cm", "m", "inch"].includes(data.modelUnits) ? data.modelUnits : null,
    originalDimensions: data.originalDimensions && [data.originalDimensions.width, data.originalDimensions.height, data.originalDimensions.depth].every((value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0) ? { width: data.originalDimensions.width, height: data.originalDimensions.height, depth: data.originalDimensions.depth } : null,

    thumbnailUrl: data.thumbnailUrl ?? null,

    status: data.status,

    printerType: data.printerType,
    material: data.material,
    baseColor: data.baseColor,

    parts: Array.isArray(data.parts)
      ? data.parts.map((part: Partial<ProjectPart>) => ({
          id: String(part.id ?? ""),
          meshUuid: typeof part.meshUuid === "string" ? part.meshUuid : undefined,
          sourcePartKey: typeof part.sourcePartKey === "string" ? part.sourcePartKey : undefined,
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
            && Math.hypot(part.explodedOffset.x, part.explodedOffset.y, part.explodedOffset.z) <= MAX_EXPLODED_OFFSET
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

    assemblySteps: Array.isArray(data.assemblySteps)
      ? data.assemblySteps.map((step: Partial<AssemblyStep>, index: number): AssemblyStep => ({
          id: String(step.id ?? ""),
          order: typeof step.order === "number" ? step.order : index + 1,
          title: String(step.title ?? ""),
          description: String(step.description ?? ""),
          partIds: Array.isArray(step.partIds) ? [...new Set(step.partIds.filter((id): id is string => typeof id === "string"))] : [],
          createdAt: typeof step.createdAt === "string" ? step.createdAt : new Date(0).toISOString(),
          updatedAt: typeof step.updatedAt === "string" ? step.updatedAt : new Date(0).toISOString(),
          imageKey: typeof step.imageKey === "string" ? step.imageKey : null,
          imageCapturedAt: typeof step.imageCapturedAt === "string" ? step.imageCapturedAt : null,
          contentVersion: typeof step.contentVersion === "number" && Number.isInteger(step.contentVersion) && step.contentVersion > 0 ? step.contentVersion : 1,
          imageContentVersion: typeof step.imageContentVersion === "number" && Number.isInteger(step.imageContentVersion) && step.imageContentVersion > 0 ? step.imageContentVersion : (typeof step.imageKey === "string" ? 1 : null),
        }))
      : [],
    importSchemaVersion: data.importSchemaVersion === 1 ? 1 : undefined,

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
  modelFormat,
  modelUnits,
  originalDimensions,
  printerType,
  material,
  baseColor,
  parts,
  importSchemaVersion,
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
    modelFormat,
    modelUnits,
    originalDimensions,

    thumbnailUrl: null,

    status: "draft",

    printerType,
    material,
    baseColor,

    parts: parts ?? [],
    importSchemaVersion: importSchemaVersion ?? null,
    palette: [],
    assemblySteps: [],

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
  assemblySteps,
}: {
  projectId: string;
  userId: string;
  parts: ProjectPart[];
  palette: PaletteColor[];
  assemblySteps: AssemblyStep[];
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
    assemblySteps,
    updatedAt: serverTimestamp(),
  });
}
