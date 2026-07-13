import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

import type {
  CreateProjectInput,
  Project,
} from "../types/Project";
import { deleteModelFile, uploadModel } from "./storage.service";

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

    modelUrl: null,
    modelStoragePath: null,
    originalFileName: localModel.originalFileName,
    originalFileSize: localModel.originalFileSize,
    originalFileType: localModel.originalFileType,

    thumbnailUrl: null,

    status: "draft",

    printerType,
    material,
    baseColor,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const createdDocument = await getDoc(projectReference);

  return mapProjectDocument(createdDocument);
}

export async function deleteProject(
  project: Project,
): Promise<void> {
  await deleteModelFile(project.modelStoragePath);
  await deleteDoc(doc(db, "projects", project.id));
}