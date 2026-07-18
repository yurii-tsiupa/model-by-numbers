"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function AuthPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  useEffect(() => { if (!isLoading && user) router.replace("/models"); }, [isLoading, router, user]);
  if (isLoading || user) return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><Loader label={t("auth.checking")}/></main>;
  return <AppShell variant="public" showNavigation={false}><main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10 sm:px-6"><section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"><h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[var(--text)]">{title}</h1><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>{children}</section></main></AppShell>;
}
