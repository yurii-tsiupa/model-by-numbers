"use client";

import {
  ArrowLeft,
  Box,
  LoaderCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Loader } from "@/components/ui/Loader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ModelEditor } from "@/features/model-editor/components/ModelEditor";
import { useProject } from "@/features/models/hooks/useProject";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to open this project.";
}

export default function ModelEditorPage() {
  const {t}=useTranslation();
  const router = useRouter();
  const params = useParams<{ projectId: string }>();

  const { user, isLoading: isAuthLoading } = useAuth();

  const projectId = params.projectId;
  const projectQuery = useProject(projectId, user?.uid);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  if (isAuthLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Loader label={t("models.loading")} />
      </main>
    );
  }

  if (projectQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-7 w-7 animate-spin text-orange-400" />

          <div className="text-center">
            <p className="text-sm font-medium text-white">
              Opening project
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Loading project data...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
            <Box className="h-6 w-6 text-red-400" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Project unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {getErrorMessage(projectQuery.error)}
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void projectQuery.refetch();
              }}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.05]"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => router.push("/models")}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Models
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <ModelEditor project={projectQuery.data} userId={user.uid} />;
}
