"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { ModelsLibrary } from "@/features/models/components/ModelsLibrary";

export default function ModelsPage() {
  const router = useRouter(); const { user, isLoading } = useAuth(); const { t } = useTranslation();
  useEffect(() => { if (!isLoading && !user) router.replace("/login"); }, [isLoading, router, user]);
  if (isLoading || !user) return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6"><Loader label={t("models.loading")}/></main>;
  return <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]"><AppHeader variant="application"/><ModelsLibrary userId={user.uid}/></main>;
}
