"use client";

import {
  Box,
  FolderCog,
  Palette,
  Images,
} from "lucide-react";

import type { Project } from "@/features/models/types/Project";

import { useModelEditorStore } from "../store/modelEditorStore";
import type { EditorSidebarTab } from "../types/EditorSidebarTab";
import { PaletteTab } from "./sidebar/PaletteTab";
import { PartsTab } from "./sidebar/PartsTab";
import { ProjectTab } from "./sidebar/ProjectTab";
import { ReferencesTab } from "@/features/references/components/ReferencesTab";

type EditorSidebarProps = {
  project: Project;
  isGeneratingThumbnail: boolean;
  thumbnailError: string | null;
  onRegenerateThumbnail: () => void;
  onOpenReferenceMode: (mode: "split" | "reference", preferredReferenceId?: string) => void;
  onReferenceDeleted: (id: string) => void;
};

const tabs: Array<{
  id: EditorSidebarTab;
  label: string;
  icon: typeof Box;
}> = [
  {
    id: "parts",
    label: "Parts",
    icon: Box,
  },
  {
    id: "palette",
    label: "Palette",
    icon: Palette,
  },
  {
    id: "project",
    label: "Project",
    icon: FolderCog,
  },
  {
    id: "references",
    label: "References",
    icon: Images,
  },
];

export function EditorSidebar({
  project,
  isGeneratingThumbnail,
  thumbnailError,
  onRegenerateThumbnail,
  onOpenReferenceMode,
  onReferenceDeleted,
}: EditorSidebarProps) {
  const activeTab = useModelEditorStore(
    (state) => state.activeSidebarTab,
  );

  const setActiveTab = useModelEditorStore(
    (state) =>
      state.setActiveSidebarTab,
  );

  return (
    <aside className="flex max-h-[20rem] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-neutral-950/70 lg:h-full lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
      <div className="grid shrink-0 grid-cols-4 border-b border-white/10 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition ${
                isActive
                  ? "bg-white/[0.07] text-white"
                  : "text-neutral-600 hover:bg-white/[0.035] hover:text-neutral-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
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

      {activeTab === "project" ? (
        <ProjectTab project={project} isGeneratingThumbnail={isGeneratingThumbnail} thumbnailError={thumbnailError} onRegenerateThumbnail={onRegenerateThumbnail} />
      ) : null}
      {activeTab === "references" ? <ReferencesTab projectId={project.id} onOpenReferenceMode={onOpenReferenceMode} onReferenceDeleted={onReferenceDeleted} /> : null}
    </aside>
  );
}
