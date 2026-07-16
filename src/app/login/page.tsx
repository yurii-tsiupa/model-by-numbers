"use client";

import { ArrowLeft, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const {t}=useTranslation();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/models");
    }
  }, [isLoading, router, user]);

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Loader label={t("auth.checking")} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-md"><div className="mb-5 flex justify-end"><LanguageSwitcher/></div>
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.back")}
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Box className="h-5 w-5 text-orange-400" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            {t("auth.welcome")}
          </h1>

          <p className="mt-3 leading-6 text-neutral-400">
            {t("auth.description")}
          </p>

          <GoogleSignInButton />

          <p className="mt-5 text-center text-xs leading-5 text-neutral-600">
            {t("auth.terms")}
          </p>
        </div>
      </div>
    </main>
  );
}
