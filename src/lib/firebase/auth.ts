import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
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

export async function registerWithEmail(email: string, password: string): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await syncUserProfile(credential.user);
  return credential;
}

export function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}
