"use client";

import {
  ArrowLeft,
  BookOpen,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { Project } from "@/features/models/types/Project";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import {
  type EditorSaveStatus,
  useModelEditorStore,
} from "../store/modelEditorStore";

type EditorHeaderProps = {
  project: Project;
  onSave: () => void;
  onGenerateGuide: () => void;
  isGuideReady: boolean;
  isGeneratingGuide: boolean;
};

export function EditorHeader({
  project,
  onSave,
  onGenerateGuide,
  isGuideReady,
  isGeneratingGuide,
}: EditorHeaderProps) {
  const router = useRouter();
  const {t}=useTranslation();
  const statusLabels:Record<Project["status"],string>={draft:t("status.draft"),processing:t("status.processing"),ready:t("status.ready"),generated:t("status.generated"),archived:t("status.archived")};
  const saveStatusLabels:Record<EditorSaveStatus,string>={saved:t("editor.saved"),dirty:t("editor.unsaved"),saving:t("editor.saving"),error:t("editor.saveFailed")};

  const isDirty = useModelEditorStore(
    (state) => state.isDirty,
  );

  const saveStatus = useModelEditorStore(
    (state) => state.saveStatus,
  );

  return (
    <header className="shrink-0 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/models")}
            aria-label={t("editor.back")}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                {project.name}
              </h1>

              <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] font-medium text-neutral-400 sm:inline-flex">
                {statusLabels[project.status]}
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs text-neutral-500">
              {saveStatusLabels[saveStatus]}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2"><LanguageSwitcher/>
          <button
            type="button"
            disabled={!isDirty || saveStatus === "saving"}
            onClick={onSave}
            className="hidden cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 sm:flex"
          >
            {saveStatus === "saving" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saveStatus === "saving" ? t("editor.saving") : t("editor.save")}
          </button>

          <button
            type="button"
            disabled={!isGuideReady || isGeneratingGuide}
            onClick={onGenerateGuide}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-2.5 text-sm font-medium text-orange-300 transition hover:bg-orange-400/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-neutral-600 sm:px-4"
          >
            {isGeneratingGuide ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}

            <span className="hidden sm:inline">
              {isGeneratingGuide
                ? t("editor.preparing")
                : t("editor.generate")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
