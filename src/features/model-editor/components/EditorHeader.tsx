"use client";

import { ArrowLeft, BookOpen, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import type { Project } from "@/features/models/types/Project";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { type EditorSaveStatus, useModelEditorStore } from "../store/modelEditorStore";

export function EditorHeader({ project, onSave, onGenerateGuide, isGuideReady, isGeneratingGuide }: { project: Project; onSave: () => void; onGenerateGuide: () => void; isGuideReady: boolean; isGeneratingGuide: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  const isDirty = useModelEditorStore(state => state.isDirty);
  const saveStatus = useModelEditorStore(state => state.saveStatus);
  const saveStatusLabels: Record<EditorSaveStatus, string> = { saved: t("editor.saved"), dirty: t("editor.unsaved"), saving: t("editor.saving"), error: t("editor.saveFailed") };
  const start = <div className="flex min-w-0 items-center gap-2"><button type="button" onClick={() => router.push("/models")} aria-label={t("editor.back")} className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><ArrowLeft className="size-4"/></button><div className="min-w-0"><p className="max-w-48 truncate font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)] sm:max-w-72">{project.name}</p><p className={`font-[family-name:var(--font-jetbrains-mono)] text-[10px] ${saveStatus === "saved" ? "text-[var(--accent-2)]" : "text-[var(--text-secondary)]"}`}>{saveStatusLabels[saveStatus]}</p></div></div>;
  const actions = <div className="flex items-center gap-2"><button type="button" disabled={!isDirty || saveStatus === "saving"} onClick={onSave} aria-label={saveStatus === "saving" ? t("editor.saving") : t("editor.save")} className="hidden min-h-10 items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text)] disabled:opacity-50 sm:flex">{saveStatus === "saving" ? <LoaderCircle className="size-4 animate-spin"/> : <Save className="size-4"/>}<span className="hidden lg:inline">{saveStatus === "saving" ? t("editor.saving") : t("editor.save")}</span></button><button type="button" disabled={!isGuideReady || isGeneratingGuide} onClick={onGenerateGuide} aria-label={isGeneratingGuide ? t("editor.preparing") : t("editor.generate")} className="inline-flex min-h-10 items-center gap-2 rounded-[10px] bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50">{isGeneratingGuide ? <LoaderCircle className="size-4 animate-spin"/> : <BookOpen className="size-4"/>}<span className="hidden lg:inline">{isGeneratingGuide ? t("editor.preparing") : t("editor.generate")}</span></button></div>;
  return <AppHeader variant="editor" contextualStart={start} contextualActions={actions} showNavigation={false}/>;
}
