import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "@/lib/firebase/client";

export async function syncUserProfile(user: User): Promise<void> {
  const userDocumentReference = doc(db, "users", user.uid);
  const userDocumentSnapshot = await getDoc(userDocumentReference);

  if (!userDocumentSnapshot.exists()) {
    await setDoc(userDocumentReference, {
      id: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      photoUrl: user.photoURL,
      plan: "free",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return;
  }

  await updateDoc(userDocumentReference, {
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    photoUrl: user.photoURL,
    updatedAt: serverTimestamp(),
  });
}