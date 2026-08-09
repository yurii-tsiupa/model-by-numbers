import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { GeneratedGuide } from "../types/GeneratedGuide";

export type GeneratedGuideFirestoreMetadata = Pick<GeneratedGuide, "id" | "projectId" | "version" | "status" | "createdAt" | "updatedAt"> & {
  ownerUid: string;
};

async function assertProjectOwner(projectId: string, ownerUid: string): Promise<void> {
  if (!projectId || !ownerUid) throw new Error("Cannot sync generated guide: missing project or owner id.");
  const project = await getDoc(doc(db, "projects", projectId));
  if (!project.exists() || project.data().userId !== ownerUid) throw new Error("Cannot sync generated guide: project ownership check failed.");
}

export const generatedGuidesFirestoreService = {
  async save(ownerUid: string, guide: GeneratedGuide): Promise<void> {
    await assertProjectOwner(guide.projectId, ownerUid);
    const metadata: GeneratedGuideFirestoreMetadata = {
      id: guide.id,
      projectId: guide.projectId,
      version: guide.version,
      status: guide.status,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      ownerUid,
    };
    await setDoc(doc(db, "projects", guide.projectId, "generatedGuides", guide.id), metadata, { merge: true });
  },

  async delete(ownerUid: string, projectId: string, guideId: string): Promise<void> {
    await assertProjectOwner(projectId, ownerUid);
    await deleteDoc(doc(db, "projects", projectId, "generatedGuides", guideId));
  },

  async deleteByProjectId(ownerUid: string, projectId: string): Promise<void> {
    await assertProjectOwner(projectId, ownerUid);
    const guides = await getDocs(collection(db, "projects", projectId, "generatedGuides"));
    if (guides.empty) return;
    const batch = writeBatch(db);
    guides.docs.forEach((guide) => batch.delete(guide.ref));
    await batch.commit();
  },
};

export function reportGeneratedGuideSyncFailure(operation: "save" | "delete", error: unknown): void {
  console.warn(`Generated guide Firestore ${operation} sync failed; the local guide remains authoritative.`, error);
}
