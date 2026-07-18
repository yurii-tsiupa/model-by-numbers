"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { normalizeAuthError } from "@/features/auth/services/auth-errors";

export function GoogleSignInButton() {
  const router = useRouter();
  const { signIn } = useAuth();
  const {t}=useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  async function handleSignIn() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await signIn();

      router.replace("/models");
    } catch (error) {
      setErrorMessage(t(`auth.errors.${normalizeAuthError(error)}`));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleSignIn}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            {t("auth.signingIn")}
          </>
        ) : (
          <>
            <GoogleIcon />
            {t("auth.google")}
          </>
        )}
      </button>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 text-center text-sm text-red-400"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.873h5.382a4.6 4.6 0 0 1-1.996 3.018v2.509h3.232c1.891-1.741 2.982-4.309 2.982-7.355Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.418l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.595-4.123H3.064v2.591A9.997 9.997 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.405 13.905A6.018 6.018 0 0 1 6.09 12c0-.659.114-1.3.314-1.905V7.504H3.064A10.005 10.005 0 0 0 2 12c0 1.614.386 3.141 1.064 4.496l3.341-2.591Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.973c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.959 2.986 14.695 2 12 2a9.997 9.997 0 0 0-8.936 5.504l3.341 2.591C7.191 7.732 9.395 5.973 12 5.973Z"
      />
    </svg>
  );
}
