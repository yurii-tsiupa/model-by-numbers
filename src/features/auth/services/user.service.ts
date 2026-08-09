import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { updateProfile } from "firebase/auth";

import { db } from "@/lib/firebase/client";
import type { UserProfile } from "../types/UserProfile";
import { normalizeDisplayName } from "../lib/displayName";
import { EMPTY_USER_BRAND_DEFAULTS, normalizeUserBrandDefaults, type UserBrandDefaults } from "../types/UserBrandDefaults";
import { EMPTY_USER_BRAND_ASSETS, normalizeUserBrandAssets } from "../types/UserBrandAssets";
import type { UserBrandAssets } from "../types/UserBrandAssets";

export async function getUserProfile(userId:string):Promise<UserProfile|null>{const snapshot=await getDoc(doc(db,"users",userId));if(!snapshot.exists())return null;const data=snapshot.data();return{id:userId,email:typeof data.email==="string"?data.email:"",displayName:typeof data.displayName==="string"?data.displayName:"",photoUrl:typeof data.photoUrl==="string"?data.photoUrl:null,brandDefaults:normalizeUserBrandDefaults(data.brandDefaults),brandAssets:normalizeUserBrandAssets(data.brandAssets)};}

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
      brandDefaults: EMPTY_USER_BRAND_DEFAULTS,
      brandAssets: EMPTY_USER_BRAND_ASSETS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return;
  }

  // Existing profiles may contain user-managed values. Authentication must not
  // overwrite them on every sign-in.
}

export async function updateUserDisplayName(user:User,value:string):Promise<UserProfile>{const displayName=normalizeDisplayName(value);await updateProfile(user,{displayName});const reference=doc(db,"users",user.uid);await setDoc(reference,{displayName,updatedAt:serverTimestamp()},{merge:true});return(await getUserProfile(user.uid))??{id:user.uid,email:user.email??"",displayName,photoUrl:user.photoURL,brandDefaults:{...EMPTY_USER_BRAND_DEFAULTS},brandAssets:{...EMPTY_USER_BRAND_ASSETS}};}

export async function updateUserBrandDefaults(userId: string, value: UserBrandDefaults): Promise<UserProfile> {
  const brandDefaults = normalizeUserBrandDefaults(value);
  const json = JSON.stringify(brandDefaults);
  if (/data:image|blob:/i.test(json)) throw new Error("Runtime image data cannot be persisted to Firestore.");
  await setDoc(doc(db, "users", userId), { brandDefaults, updatedAt: serverTimestamp() }, { merge: true });
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error("Unable to load updated profile.");
  return profile;
}

export async function updateUserBrandAssets(userId: string, value: UserBrandAssets): Promise<UserProfile> {
  const brandAssets = normalizeUserBrandAssets(value);
  const json = JSON.stringify(brandAssets);
  if (/data:image|blob:/i.test(json)) throw new Error("Runtime image data cannot be persisted to Firestore.");
  await setDoc(doc(db, "users", userId), { brandAssets, updatedAt: serverTimestamp() }, { merge: true });
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error("Unable to load updated profile.");
  return profile;
}
