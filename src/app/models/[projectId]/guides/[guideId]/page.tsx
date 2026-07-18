"use client";

import {
  ArrowLeft,
  FileQuestion,
} from "lucide-react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GuidePreview } from "@/features/guides/components/GuidePreview";
import { useDeleteGeneratedGuide } from "@/features/guides/hooks/useDeleteGeneratedGuide";
import { useGeneratedGuide } from "@/features/guides/hooks/useGeneratedGuides";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useProject } from "@/features/models/hooks/useProject";
import { useCurrentGuideTemplate } from "@/features/templates/hooks/useCurrentGuideTemplate";

export default function SavedGuidePage() {
  const params = useParams<{
    projectId: string;
    guideId: string;
  }>();

  const router = useRouter();
  const { t } = useTranslation();

  const {
    user,
    isLoading: authLoading,
  } = useAuth();

  const projectQuery = useProject(
    params.projectId,
    user?.uid,
  );

  const guideQuery = useGeneratedGuide(
    params.guideId,
  );
  const guideTemplate = useCurrentGuideTemplate(projectQuery.data, user?.uid, guideQuery.data?.snapshot.templateId);

  const deletion = useDeleteGeneratedGuide(
    params.projectId,
  );

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const editorHref = `/models/${params.projectId}`;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [
    authLoading,
    router,
    user,
  ]);

  const isLoading =
    authLoading ||
    !user ||
    projectQuery.isLoading ||
    guideQuery.isLoading ||
    guideTemplate.isLoading;


  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <Loader
          label={t(
            "guide.loadingSaved",
          )}
        />
      </main>
    );
  }

  const project = projectQuery.data;
  const guide = guideQuery.data;

  const unavailable =
    projectQuery.isError ||
    guideQuery.isError ||
    !project ||
    project.userId !== user.uid ||
    !guide ||
    guide.projectId !== params.projectId;

  if (unavailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
        <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <FileQuestion
              className="h-5 w-5 text-[var(--accent)]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <p className="mt-5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Guide unavailable
          </p>

          <h1 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-[-0.02em] text-[var(--text)]">
            {t(
              "guide.savedNotFound",
            )}
          </h1>

          <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-6 text-[var(--text-secondary)]">
            {t(
              "guide.savedNotFoundDescription",
            )}
          </p>

          <Link
            href={editorHref}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={2}
              aria-hidden="true"
            />

            {t("guide.backEditor")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <>
      <GuidePreview
        previewProject={project}
        template={guideTemplate.current}
        guide={{
          ...guide.snapshot,
          locale:
            guide.snapshot.locale ??
            "en",
        }}
        savedFileName={
          guide.fileName
        }
        savedPdfBlob={guide.pdfBlob}
        skipSave
        onDelete={() => {
          setConfirmDelete(true);
        }}
      />

      <ConfirmationModal
        isOpen={confirmDelete}
        title={t(
          "guide.deleteTitle",
          {
            version: guide.version,
          },
        )}
        description={t(
          "guide.deleteDescription",
        )}
        confirmLabel={t(
          "guide.delete",
        )}
        variant="danger"
        isLoading={
          deletion.isPending
        }
        onClose={() => {
          if (!deletion.isPending) {
            setConfirmDelete(false);
          }
        }}
        onConfirm={() => {
          deletion.mutate(guide.id, {
            onSuccess: () => {
              router.push(
                editorHref,
              );
            },
          });
        }}
      />
    </>
  );
}
