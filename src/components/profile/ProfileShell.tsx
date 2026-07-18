"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { ProfileNavigation } from "./ProfileNavigation";

export function ProfileShell({ children }: { children: ReactNode }) {
  const router=useRouter(); const {user,isLoading}=useAuth(); const {t}=useTranslation();
  useEffect(()=>{if(!isLoading&&!user)router.replace("/login")},[isLoading,router,user]);
  if(isLoading||!user)return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><Loader label={t("profile.loading")}/></main>;
  return <AppShell variant="application"><div className="flex min-h-[calc(100dvh-4rem)] w-full min-w-0 flex-col md:flex-row"><ProfileNavigation/><main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main></div></AppShell>;
}
