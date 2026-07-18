"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const {t}=useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    try {
      setIsSubmitting(true);

      await signOut();

      router.replace("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={handleSignOut}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      {isSubmitting ? t("auth.signingOut") : t("auth.signOut")}
    </button>
  );
}
