import { MAX_DISPLAY_NAME_LENGTH, MIN_DISPLAY_NAME_LENGTH, normalizeDisplayName } from "../lib/displayName";
export type AuthValidationCode = "required" | "invalidEmail" | "passwordTooShort" | "passwordsMismatch" | "displayNameTooShort" | "displayNameTooLong";
export type AuthFieldErrors = Partial<Record<"displayName" | "email" | "password" | "confirmPassword", AuthValidationCode>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;
export function validateDisplayName(value:string):AuthValidationCode|undefined{const normalized=normalizeDisplayName(value);return!normalized?"required":normalized.length<MIN_DISPLAY_NAME_LENGTH?"displayNameTooShort":normalized.length>MAX_DISPLAY_NAME_LENGTH?"displayNameTooLong":undefined;}

function validateEmail(email: string): AuthValidationCode | undefined {
  if (!email.trim()) return "required";
  if (!EMAIL_PATTERN.test(email.trim())) return "invalidEmail";
}

export function validateLogin(email: string, password: string): AuthFieldErrors {
  return { email: validateEmail(email), password: password ? undefined : "required" };
}

export function validateRegistration(displayName:string,email: string, password: string, confirmPassword: string): AuthFieldErrors {
  const normalizedName=normalizeDisplayName(displayName);
  return {
    displayName:validateDisplayName(normalizedName),
    email: validateEmail(email),
    password: !password ? "required" : password.length < MIN_PASSWORD_LENGTH ? "passwordTooShort" : undefined,
    confirmPassword: !confirmPassword ? "required" : password !== confirmPassword ? "passwordsMismatch" : undefined,
  };
}

export function validatePasswordReset(email: string): AuthFieldErrors {
  return { email: validateEmail(email) };
}

export function hasAuthFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
