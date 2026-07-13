"use client";

import { ArrowLeft, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/models");
    }
  }, [isLoading, router, user]);

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Loader label="Checking your session..." />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Box className="h-5 w-5 text-orange-400" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-3 leading-6 text-neutral-400">
            Sign in to manage your models and painting guides.
          </p>

          <GoogleSignInButton />

          <p className="mt-5 text-center text-xs leading-5 text-neutral-600">
            By continuing, you agree to use the platform according to
            its terms and privacy policy.
          </p>
        </div>
      </div>
    </main>
  );
}