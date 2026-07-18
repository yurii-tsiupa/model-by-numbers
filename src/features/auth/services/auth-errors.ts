import { FirebaseError } from "firebase/app";

export type AuthErrorCode =
  | "emailAlreadyInUse"
  | "invalidEmail"
  | "weakPassword"
  | "invalidCredentials"
  | "userDisabled"
  | "tooManyRequests"
  | "networkError"
  | "popupClosed"
  | "popupBlocked"
  | "popupOpen"
  | "unauthorizedDomain"
  | "unknown";

export function normalizeAuthError(error: unknown): AuthErrorCode {
  if (!(error instanceof FirebaseError)) return "unknown";
  switch (error.code) {
    case "auth/email-already-in-use": return "emailAlreadyInUse";
    case "auth/invalid-email": return "invalidEmail";
    case "auth/weak-password": return "weakPassword";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password": return "invalidCredentials";
    case "auth/user-disabled": return "userDisabled";
    case "auth/too-many-requests": return "tooManyRequests";
    case "auth/network-request-failed": return "networkError";
    case "auth/popup-closed-by-user": return "popupClosed";
    case "auth/popup-blocked": return "popupBlocked";
    case "auth/cancelled-popup-request": return "popupOpen";
    case "auth/unauthorized-domain": return "unauthorizedDomain";
    default: return "unknown";
  }
}
