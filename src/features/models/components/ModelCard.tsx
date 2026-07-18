"use client";

import {
  Box,
  CalendarDays,
  FileBox,
  History,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type MouseEvent,
  useState,
  useEffect,
  useMemo,
} from "react";

import type { Project } from "../types/Project";
import type { ProjectThumbnail } from "../types/ProjectThumbnail";
import type { GeneratedGuide } from "@/features/guides/types/GeneratedGuide";
import { getGuideParts } from "@/features/guides/lib/isPartIncludedInGuide";
import { getGuidePalette } from "@/features/guides/lib/getGuidePalette";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatCount,formatLocalizedDate } from "@/features/i18n/lib/i18n";

type ModelCardProps = {
  project: Project;
  isDeleting: boolean;
  onDelete: (project: Project) => void;
  thumbnail: ProjectThumbnail | null;
  latestGuide: GeneratedGuide | null;
  isLocalDataLoading: boolean;
};

function formatFileSize(bytes: number,unknown:string): string {
  if (!bytes) {
    return unknown;
  }

  const kilobytes = bytes / 1024;
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(kilobytes))} KB`;
}

export function ModelCard({
  project,
  isDeleting,
  onDelete,
  thumbnail,
  latestGuide,
  isLocalDataLoading,
}: ModelCardProps) {
  const router = useRouter();
  const {t,locale}=useTranslation();
  const statusLabels:Record<Project["status"],string>={draft:t("status.draft"),processing:t("status.processing"),ready:t("status.ready"),generated:t("status.generated"),archived:t("status.archived")};

  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);
  const localThumbnailUrl = useMemo(() => thumbnail ? URL.createObjectURL(thumbnail.blob) : null, [thumbnail]);
  useEffect(() => () => { if (localThumbnailUrl) URL.revokeObjectURL(localThumbnailUrl); }, [localThumbnailUrl]);
  const thumbnailUrl = localThumbnailUrl ?? project.thumbnailUrl ?? "";
  const shouldShowThumbnail = Boolean(thumbnailUrl) && failedThumbnailUrl !== thumbnailUrl;
  const includedParts = getGuideParts(project.parts);
  const usedColors = getGuidePalette(project.parts, project.palette);

  function openProject() {
    if (isDeleting) {
      return;
    }

    router.push(`/models/${project.id}`);
  }

  function handleCardKeyDown(
    event: KeyboardEvent<HTMLElement>,
  ) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openProject();
  }

  function handleDelete(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    onDelete(project);
  }

  return (
    <article
      role="link"
      tabIndex={isDeleting ? -1 : 0}
      aria-label={t("models.openProject", {
        name: project.name,
      })}
      onClick={openProject}
      onKeyDown={handleCardKeyDown}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition ${
        isDeleting
          ? "cursor-wait opacity-60"
          : "cursor-pointer hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
        {isLocalDataLoading ? (
          <div className="absolute inset-0 animate-pulse bg-[var(--border)] opacity-40" />
        ) : null}

        {shouldShowThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={project.name}
            onError={() =>
              setFailedThumbnailUrl(thumbnailUrl)
            }
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <Box
                  className="h-9 w-9 text-[var(--accent)]"
                  strokeWidth={1.5}
                />
              </div>

              <div
                aria-hidden="true"
                className="mt-3 flex flex-col items-center gap-1"
              >
                <span className="h-1 w-14 rounded-full bg-[var(--accent)] opacity-25" />
                <span className="h-1 w-10 rounded-full bg-[var(--accent)] opacity-15" />
                <span className="h-1 w-6 rounded-full bg-[var(--accent)] opacity-10" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex rounded-full border px-3 py-1.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.12em] ${
              project.status === "ready" ||
              project.status === "generated"
                ? "border-[color-mix(in_srgb,var(--accent-2)_35%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_10%,var(--card))] text-[var(--accent-2)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)]"
            }`}
          >
            {statusLabels[project.status]}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5">
          <span
            className="h-4 w-4 rounded-full border border-[var(--border)]"
            style={{
              backgroundColor: project.baseColor,
            }}
            title={`${t("guide.baseColor")}: ${
              project.baseColor
            }`}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="min-w-0">
          <h2 className="truncate font-[family-name:var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
            {project.name}
          </h2>

          <p className="mt-1 line-clamp-1 font-[family-name:var(--font-inter)] text-sm leading-5 text-[var(--text-secondary)]">
            {project.description ||
              t("models.noDescription")}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {t("guide.parts")}
            </p>

            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]">
              {formatCount(
                locale,
                includedParts.length,
                "part",
              )}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {t("guide.colors")}
            </p>

            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]">
              {formatCount(
                locale,
                usedColors.length,
                "color",
              )}
            </p>
          </div>
        </div>

        {latestGuide ? (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-[color-mix(in_srgb,var(--accent-2)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_8%,var(--card))] px-3 py-2.5">
            <span className="font-[family-name:var(--font-inter)] text-xs font-medium text-[var(--accent-2)]">
              {t("status.generated")}
            </span>

            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--accent-2)]">
              {t("history.version", {
                version: latestGuide.version,
              })}
            </span>
          </div>
        ) : null}

        <div className="mt-4 space-y-2.5 border-t border-[var(--border)] pt-3">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-[var(--text-secondary)]">
              <FileBox className="h-3.5 w-3.5 shrink-0" />

              <span className="truncate">
                {project.originalFileName ||
                  t("models.modelFile")}
              </span>
            </span>

            <span className="shrink-0 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--text-secondary)]">
              {formatFileSize(
                project.originalFileSize,
                t("models.unknownSize"),
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {t("models.created")}
            </span>

            <span className="text-right text-[var(--text-secondary)]">
              {formatLocalizedDate(
                project.createdAt,
                locale,
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <History className="h-3.5 w-3.5 shrink-0" />
              {t("models.updatedLabel")}
            </span>

            <span className="text-right text-[var(--text-secondary)]">
              {formatLocalizedDate(
                project.updatedAt,
                locale,
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              event.stopPropagation();
              openProject();
            }}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 font-[family-name:var(--font-inter)] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Box className="h-4 w-4" />
            {t("common.open")}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-label={t("models.deleteProject", {
              name: project.name,
            })}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
