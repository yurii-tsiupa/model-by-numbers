"use client";

import { ArrowLeft, Box, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GuideNotReadyState } from "@/features/guides/components/GuideNotReadyState";
import { GuidePreview } from "@/features/guides/components/GuidePreview";
import { buildGuideData } from "@/features/guides/lib/buildGuideData";
import { useGuideGenerationStore } from "@/features/guides/store/guideGenerationStore";
import type { GuideImages } from "@/features/guides/types/ModelGuide";
import { getGuideReadiness } from "@/features/model-editor/lib/getGuideReadiness";
import { useProject } from "@/features/models/hooks/useProject";
import { useReferenceImages } from "@/features/references/hooks/useReferenceImages";
import { referencesToGuideImages } from "@/features/references/lib/referenceToDataUrl";
import type { GuideReferenceImage } from "@/features/guides/types/ModelGuide";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

const EMPTY_GUIDE_IMAGES: GuideImages = {
  original: null,
  base: null,
  painted: null,
  numbers: null,
};

function getProjectError(error: unknown): {
  title: string;
  message: string;
  isAccessError: boolean;
} {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to load this project.";
  const normalizedMessage = message.toLowerCase();
  const isAccessError =
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("not found");

  return {
    title: isAccessError
      ? "Guide unavailable"
      : "Unable to load guide",
    message,
    isAccessError,
  };
}

export default function GuidePage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const {locale,t}=useTranslation();
  const projectId = params.projectId;
  const projectQuery = useProject(projectId, user?.uid);
  const referencesQuery=useReferenceImages(projectId);
  const [guideReferences,setGuideReferences]=useState<GuideReferenceImage[]|null>(null);
  const capturedProjectId = useGuideGenerationStore(
    (state) => state.projectId,
  );
  const capturedImages = useGuideGenerationStore(
    (state) => state.images,
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);
  useEffect(()=>{if(!referencesQuery.data)return;let active=true;void referencesToGuideImages(referencesQuery.data).then(rows=>{if(active)setGuideReferences(rows);}).catch(()=>{if(active)setGuideReferences([]);});return()=>{active=false;};},[referencesQuery.data]);

  if (isAuthLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Loader label={t("guide.checking")} />
      </main>
    );
  }

  if (projectQuery.isLoading || referencesQuery.isLoading || guideReferences===null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Loader label={t("guide.loading")} />
      </main>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    const errorState = getProjectError(projectQuery.error);
    const ErrorIcon = errorState.isAccessError ? ShieldAlert : Box;

    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
            <ErrorIcon className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="mt-5 text-xl font-semibold">
            {errorState.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {errorState.message}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {!errorState.isAccessError ? (
              <button
                type="button"
                onClick={() => void projectQuery.refetch()}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.05]"
              >
                Try Again
              </button>
            ) : null}
            <Link
              href="/models"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Models
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const project = projectQuery.data;

  if (project.userId !== user.uid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-red-400/15 bg-red-400/[0.035] p-8 text-center">
          <ShieldAlert className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold">{t("guide.unavailable")}</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {t("guide.noPermission")}
          </p>
          <Link
            href="/models"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950"
          >
            {t("guide.backModels")}
          </Link>
        </section>
      </main>
    );
  }

  const readiness = getGuideReadiness({
    project,
    parts: project.parts,
    palette: project.palette,
    locale,
  });

  if (!readiness.isReady) {
    return (
      <GuideNotReadyState
        projectId={projectId}
        readiness={readiness}
      />
    );
  }

  const guide = buildGuideData({
    project,
    parts: project.parts,
    palette: project.palette,
    images:
      capturedProjectId === projectId && capturedImages
        ? capturedImages
        : EMPTY_GUIDE_IMAGES,
    author: user.displayName?.trim() || t("common.user"),
    references: guideReferences,
    locale,
  });

  return <GuidePreview guide={guide} />;
}
