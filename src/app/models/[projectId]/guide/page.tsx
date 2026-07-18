"use client";

import {
  ArrowLeft,
  Box,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GuideNotReadyState } from "@/features/guides/components/GuideNotReadyState";
import { GuidePreview } from "@/features/guides/components/GuidePreview";
import { buildGuideData } from "@/features/guides/lib/buildGuideData";
import { useGuideGenerationStore } from "@/features/guides/store/guideGenerationStore";
import type {
  GuideImages,
  GuideReferenceImage,
} from "@/features/guides/types/ModelGuide";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { getGuideReadiness } from "@/features/model-editor/lib/getGuideReadiness";
import { useProject } from "@/features/models/hooks/useProject";
import { useReferenceImages } from "@/features/references/hooks/useReferenceImages";
import { referencesToGuideImages } from "@/features/references/lib/referenceToDataUrl";
import { loadGuideAssetReferences } from "@/features/guides/services/assets/loadGuideAsset";
import type { GuideAssetReference } from "@/features/guides/services/assets/types";

const EMPTY_GUIDE_IMAGES: GuideImages = {
  original: null,
  base: null,
  painted: null,
  numbers: null,
};

type ProjectErrorState = {
  title: string;
  message: string;
  isAccessError: boolean;
};

function getProjectError(error: unknown): ProjectErrorState {
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

type GuideLoadingStateProps = {
  label: string;
};

function GuideLoadingState({ label }: GuideLoadingStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
      <section className="flex flex-col items-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute bottom-1 h-8 w-11 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          <span className="absolute bottom-3 h-8 w-11 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          <span className="absolute bottom-5 h-8 w-11 rounded-xl border border-[color:var(--accent)] bg-[var(--card)]" />

          <div className="relative z-10">
            <Loader label={label} />
          </div>
        </div>

        <p className="mt-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          {label}
        </p>
      </section>
    </main>
  );
}

type GuideErrorStateProps = {
  title: string;
  message: string;
  isAccessError?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  backLabel: string;
};

function GuideErrorState({
  title,
  message,
  isAccessError = false,
  onRetry,
  retryLabel = "Try again",
  backLabel,
}: GuideErrorStateProps) {
  const ErrorIcon = isAccessError ? ShieldAlert : Box;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
      <section className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
            <ErrorIcon
              className="h-5 w-5 text-[var(--text-secondary)]"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Guide
            </p>

            <h1 className="mt-1 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-[-0.02em] text-[var(--text)]">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {message}
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-[var(--border)]" />

        <div
          className={`grid gap-2 ${
            onRetry ? "sm:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {retryLabel}
            </button>
          ) : null}

          <Link
            href="/models"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function GuidePage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();

  const { user, isLoading: isAuthLoading } = useAuth();
  const { locale, t } = useTranslation();

  const projectId = params.projectId;

  const projectQuery = useProject(projectId, user?.uid);
  const referencesQuery = useReferenceImages(projectId);

  const [guideReferences, setGuideReferences] = useState<
    GuideReferenceImage[] | null
  >(null);
  const [storedAssetReferences, setStoredAssetReferences] = useState<GuideAssetReference[] | null>(null);

  const capturedProjectId = useGuideGenerationStore(
    (state) => state.projectId,
  );

  const capturedImages = useGuideGenerationStore(
    (state) => state.images,
  );

  const guideSettings = useGuideGenerationStore(
    (state) => state.settings,
  );

  const explodedView = useGuideGenerationStore(
    (state) => state.explodedView,
  );

  const assemblySteps = useGuideGenerationStore(
    (state) => state.assemblySteps,
  );
  const assetReferences = useGuideGenerationStore((state) => state.assetReferences);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (!referencesQuery.data) {
      return;
    }

    let isActive = true;

    void referencesToGuideImages(referencesQuery.data)
      .then((references) => {
        if (isActive) {
          setGuideReferences(references);
        }
      })
      .catch(() => {
        if (isActive) {
          setGuideReferences([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, [referencesQuery.data]);

  useEffect(() => {
    let active = true;
    void loadGuideAssetReferences(projectId).then(references => { if (active) setStoredAssetReferences(references); }).catch(() => { if (active) setStoredAssetReferences([]); });
    return () => { active = false; };
  }, [projectId]);

  if (isAuthLoading || !user) {
    return <GuideLoadingState label={t("guide.checking")} />;
  }

  if (
    projectQuery.isLoading ||
    referencesQuery.isLoading ||
    guideReferences === null || storedAssetReferences === null
  ) {
    return <GuideLoadingState label={t("guide.loading")} />;
  }

  if (projectQuery.isError || !projectQuery.data) {
    const errorState = getProjectError(projectQuery.error);

    return (
      <GuideErrorState
        title={errorState.title}
        message={errorState.message}
        isAccessError={errorState.isAccessError}
        onRetry={
          errorState.isAccessError
            ? undefined
            : () => void projectQuery.refetch()
        }
        backLabel={t("guide.backModels")}
      />
    );
  }

  const project = projectQuery.data;

  if (project.userId !== user.uid) {
    return (
      <GuideErrorState
        title={t("guide.unavailable")}
        message={t("guide.noPermission")}
        isAccessError
        backLabel={t("guide.backModels")}
      />
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
    references:
      guideSettings?.includeReferenceImages === false
        ? []
        : guideReferences,
    locale,
    settings: guideSettings ?? undefined,
    explodedView,
    assemblySteps,
  });
  guide.assetReferences = capturedProjectId === projectId && assetReferences.length > 0 ? assetReferences : storedAssetReferences;

  return <GuidePreview guide={guide} />;
}
