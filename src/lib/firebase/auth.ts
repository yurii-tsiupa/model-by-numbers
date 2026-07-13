import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";

import { syncUserProfile } from "@/features/auth/services/user.service";
import { auth } from "@/lib/firebase/client";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInWithGoogle(): Promise<UserCredential> {
  const credential = await signInWithPopup(auth, googleProvider);

  await syncUserProfile(credential.user);

  return credential;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}