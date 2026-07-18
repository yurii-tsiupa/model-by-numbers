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
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <Loader label={t("models.loading")} />
      </main>
    );
  }

  if (projectQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-7 w-7 animate-spin text-[var(--accent)]" />

          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text)]">
              {t("editor.openingProject")}
            </p>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("editor.loadingProjectData")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
            <Box className="h-6 w-6 text-[var(--accent)]" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            {t("editor.projectUnavailable")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {t("editor.openFailed")}
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void projectQuery.refetch();
              }}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--text)]"
            >
              {t("common.retry")}
            </button>

            <button
              type="button"
              onClick={() => router.push("/models")}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-foreground)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("editor.back")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <ModelEditor project={projectQuery.data} userId={user.uid} />;
}
