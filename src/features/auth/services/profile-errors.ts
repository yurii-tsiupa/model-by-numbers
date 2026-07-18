import { FirebaseError } from "firebase/app";
export type ProfileUpdateErrorCode="invalidDisplayName"|"notAuthenticated"|"networkError"|"permissionDenied"|"unknown";
export function normalizeProfileUpdateError(error:unknown):ProfileUpdateErrorCode{if(!(error instanceof FirebaseError))return"unknown";if(error.code==="auth/network-request-failed"||error.code==="unavailable")return"networkError";if(error.code==="permission-denied")return"permissionDenied";return"unknown";}
