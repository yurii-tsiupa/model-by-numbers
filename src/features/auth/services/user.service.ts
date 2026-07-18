import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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

  // Existing profiles may contain user-managed values. Authentication must not
  // overwrite them on every sign-in.
}
