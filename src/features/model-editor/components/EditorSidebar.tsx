"use client";

import {
  Box,
  FolderCog,
  Palette,
  Images,
  Wrench,
  ListOrdered,
} from "lucide-react";

import type { Project } from "@/features/models/types/Project";
import { useEffect, useRef, type KeyboardEvent, type WheelEvent } from "react";

import { useModelEditorStore } from "../store/modelEditorStore";
import type { EditorSidebarTab } from "../types/EditorSidebarTab";
import { PaletteTab } from "./sidebar/PaletteTab";
import { PartsTab } from "./sidebar/PartsTab";
import { ProjectTab } from "./sidebar/ProjectTab";
import { ReferencesTab } from "@/features/references/components/ReferencesTab";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { AssemblyTab } from "./assembly/AssemblyTab";
import { PaintingOrderTab } from "./sidebar/PaintingOrderTab";
import type { AssemblyStep } from "@/features/models/types/AssemblyStep";
import type { GuideSettings } from "@/features/guides/types/ModelGuide";

type EditorSidebarProps = {
  project: Project;
  isUpdatingBaseColor: boolean;
  onUpdateBaseColor: (color: string) => void;
  isGeneratingThumbnail: boolean;
  thumbnailError: string | null;
  onRegenerateThumbnail: () => void;
  onOpenReferenceMode: (mode: "split" | "reference", preferredReferenceId?: string) => void;
  onReferenceDeleted: (id: string) => void;
  onFocusAssemblyStep: (stepId: string) => void;
  onExitAssemblyFocus: () => void;
  onCaptureAssemblyImage: (step: AssemblyStep) => Promise<Blob>;
  onDeleteAssemblyImage: (step: AssemblyStep) => Promise<void>;
  onDeleteAssemblyStep: (step: AssemblyStep) => Promise<void>;
  guideSettings: GuideSettings;
};

export function EditorSidebar({
  project,
  isUpdatingBaseColor,
  onUpdateBaseColor,
  isGeneratingThumbnail,
  thumbnailError,
  onRegenerateThumbnail,
  onOpenReferenceMode,
  onReferenceDeleted,
  onFocusAssemblyStep,
  onExitAssemblyFocus,
  onCaptureAssemblyImage,
  onDeleteAssemblyImage,
  onDeleteAssemblyStep,
  guideSettings,
}: EditorSidebarProps) {
  const {t}=useTranslation();
  const tabs:Array<{id:EditorSidebarTab;label:string;icon:typeof Box}>=[{id:"parts",label:t("editor.tabs.parts"),icon:Box},{id:"palette",label:t("editor.tabs.palette"),icon:Palette},{id:"paintingOrder",label:t("paintingOrder.tab"),icon:ListOrdered},{id:"assembly",label:t("editor.tabs.assembly"),icon:Wrench},{id:"project",label:t("editor.tabs.project"),icon:FolderCog},{id:"references",label:t("editor.tabs.references"),icon:Images}];
  const activeTab = useModelEditorStore(
    (state) => state.activeSidebarTab,
  );

  const setActiveTab = useModelEditorStore(
    (state) =>
      state.setActiveSidebarTab,
  );

  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tabListRef.current
      ?.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeTab]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    tabListRef.current?.querySelector<HTMLButtonElement>(`[data-tab-id="${nextTab.id}"]`)?.focus();
  }

  function handleTabWheel(event: WheelEvent<HTMLDivElement>) {
    if (!tabListRef.current || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    event.preventDefault();
    tabListRef.current.scrollLeft += event.deltaY;
  }

  return (
    <aside className="flex max-h-[20rem] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-[var(--border)] bg-[var(--card)] lg:h-full lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        onWheel={handleTabWheel}
        className="flex shrink-0 gap-1 overflow-x-auto overscroll-x-contain border-b border-[var(--border)] p-2 [scrollbar-width:thin]"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-tab-id={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 font-[family-name:var(--font-inter)] text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                isActive
                  ? "bg-[var(--bg)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "parts" ? (
        <PartsTab />
      ) : null}

      {activeTab === "palette" ? (
        <PaletteTab />
      ) : null}
      {activeTab === "paintingOrder" ? <PaintingOrderTab /> : null}

      {activeTab === "project" ? (
        <ProjectTab project={project} isUpdatingBaseColor={isUpdatingBaseColor} onUpdateBaseColor={onUpdateBaseColor} guideSettings={guideSettings} isGeneratingThumbnail={isGeneratingThumbnail} thumbnailError={thumbnailError} onRegenerateThumbnail={onRegenerateThumbnail} />
      ) : null}
      {activeTab === "references" ? <ReferencesTab projectId={project.id} onOpenReferenceMode={onOpenReferenceMode} onReferenceDeleted={onReferenceDeleted} /> : null}
      {activeTab === "assembly" ? <AssemblyTab projectId={project.id} onFocusStep={onFocusAssemblyStep} onExitFocus={onExitAssemblyFocus} onCaptureImage={onCaptureAssemblyImage} onDeleteImage={onDeleteAssemblyImage} onDeleteStep={onDeleteAssemblyStep} /> : null}
    </aside>
  );
}
