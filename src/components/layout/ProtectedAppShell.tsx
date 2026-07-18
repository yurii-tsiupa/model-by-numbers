"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { AppShell } from "./AppShell";

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  const router = useRouter(); const { user, isLoading } = useAuth(); const { t } = useTranslation();
  useEffect(() => { if (!isLoading && !user) router.replace("/login"); }, [isLoading, router, user]);
  if (isLoading || !user) return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><Loader label={t("auth.checking")}/></main>;
  return <AppShell variant="application"><main className="min-h-[calc(100dvh-4rem)] w-full min-w-0 p-4 sm:p-6 lg:p-8">{children}</main></AppShell>;
}
