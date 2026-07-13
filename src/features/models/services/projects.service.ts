import {
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
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

    modelUrl: data.modelUrl,
    modelStoragePath: data.modelStoragePath,
    originalFileName: data.originalFileName,

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
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(projectsQuery);

  return snapshot.docs.map(mapProjectDocument);
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
  const projectReference = doc(collection(db, "projects"));
  const projectId = projectReference.id;

  let uploadedStoragePath: string | null = null;

  try {
    const uploadedModel = await uploadModel({
      userId,
      projectId,
      file,
      onProgress: onUploadProgress,
    });

    uploadedStoragePath = uploadedModel.storagePath;

    await setDoc(projectReference, {
      id: projectId,
      userId,

      name: name.trim(),
      description: description.trim(),

      modelUrl: uploadedModel.downloadUrl,
      modelStoragePath: uploadedModel.storagePath,
      originalFileName: file.name,

      thumbnailUrl: null,

      status: "ready",

      printerType,
      material,
      baseColor,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const createdDocument = await getDoc(projectReference);

    return mapProjectDocument(createdDocument);
  } catch (error) {
    if (uploadedStoragePath) {
      await deleteModelFile(uploadedStoragePath).catch(() => undefined);
    }

    throw error;
  }
}

export async function deleteProject(
  project: Project,
): Promise<void> {
  await deleteModelFile(project.modelStoragePath);

  await deleteDoc(doc(db, "projects", project.id));
}