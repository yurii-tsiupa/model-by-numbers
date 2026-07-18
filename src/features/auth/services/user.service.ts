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

export async function getUserProfile(userId:string):Promise<UserProfile|null>{const snapshot=await getDoc(doc(db,"users",userId));if(!snapshot.exists())return null;const data=snapshot.data();return{id:userId,email:typeof data.email==="string"?data.email:"",displayName:typeof data.displayName==="string"?data.displayName:"",photoUrl:typeof data.photoUrl==="string"?data.photoUrl:null};}

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

export async function updateUserDisplayName(user:User,value:string):Promise<UserProfile>{const displayName=normalizeDisplayName(value);await updateProfile(user,{displayName});const reference=doc(db,"users",user.uid);await setDoc(reference,{displayName,updatedAt:serverTimestamp()},{merge:true});return(await getUserProfile(user.uid))??{id:user.uid,email:user.email??"",displayName,photoUrl:user.photoURL};}
