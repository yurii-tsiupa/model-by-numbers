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
      aria-label={t("models.openProject",{name:project.name})}
      onClick={openProject}
      onKeyDown={handleCardKeyDown}
      className={`group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025] transition duration-300 ${
        isDeleting
          ? "cursor-wait opacity-70"
          : "cursor-pointer hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-neutral-900">
        {isLocalDataLoading ? <div className="absolute inset-0 animate-pulse bg-white/[0.035]" /> : null}
        {shouldShowThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={project.name}
            onError={() => setFailedThumbnailUrl(thumbnailUrl)}
            className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12),transparent_60%)]" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40">
              <Box className="h-9 w-9 text-orange-400/80" />
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur-md">
          {statusLabels[project.status]}
        </span>

        <div
          className="absolute bottom-4 right-4 h-5 w-5 rounded-full border border-white/20 shadow-lg shadow-black/40"
          style={{ backgroundColor: project.baseColor }}
          title={`${t("guide.baseColor")}: ${project.baseColor}`}
        />
      </div>

      <div className="p-5">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-white">
            {project.name}
          </h2>

          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-neutral-500">
            {project.description || t("models.noDescription")}
          </p>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs text-neutral-500">
          <div className="flex items-center justify-between gap-3"><span>{formatCount(locale,includedParts.length,"part")}</span><span>{formatCount(locale,usedColors.length,"color")}</span>{latestGuide ? <span>{t("history.version",{version:latestGuide.version})}</span> : null}</div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <FileBox className="h-3.5 w-3.5 shrink-0" />

              <span className="truncate">
                {project.originalFileName || t("models.modelFile")}
              </span>
            </span>

            <span className="shrink-0">
              {formatFileSize(project.originalFileSize,t("models.unknownSize"))}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              {t("models.created")}
            </span>

            <span>{formatLocalizedDate(project.createdAt,locale,{day:"2-digit",month:"short",year:"numeric"})}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              {t("models.updatedLabel")}
            </span>

            <span>{formatLocalizedDate(project.updatedAt,locale,{day:"2-digit",month:"short",year:"numeric"})}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              event.stopPropagation();
              openProject();
            }}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Box className="h-4 w-4" />
            {t("common.open")}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-label={t("models.deleteProject",{name:project.name})}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-500 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
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
