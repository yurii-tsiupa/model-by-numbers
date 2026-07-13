"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

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
      className="flex cursor-pointer items-center gap-2 text-sm text-neutral-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      {isSubmitting ? "Signing out..." : "Sign out"}
    </button>
  );
}