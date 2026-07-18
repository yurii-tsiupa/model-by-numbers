export type AuthValidationCode = "required" | "invalidEmail" | "passwordTooShort" | "passwordsMismatch";
export type AuthFieldErrors = Partial<Record<"email" | "password" | "confirmPassword", AuthValidationCode>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

function validateEmail(email: string): AuthValidationCode | undefined {
  if (!email.trim()) return "required";
  if (!EMAIL_PATTERN.test(email.trim())) return "invalidEmail";
}

export function validateLogin(email: string, password: string): AuthFieldErrors {
  return { email: validateEmail(email), password: password ? undefined : "required" };
}

export function validateRegistration(email: string, password: string, confirmPassword: string): AuthFieldErrors {
  return {
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
