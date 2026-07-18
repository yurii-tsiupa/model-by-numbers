import {
  Eye,
  EyeOff,
  Focus,
  Grid3X3,
  Maximize,
  RotateCcw,
  Scan,
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ViewerToolbarProps = {
  simplified?: boolean;
  isGridVisible: boolean;
  hasParts: boolean;
  hasSelectedPart: boolean;
  partActionsDisabled?: boolean;

  onResetCamera: () => void;
  onShowAll: () => void;
  onHideSelected: () => void;
  onIsolateSelected: () => void;
  onToggleGrid: () => void;
  onFitModel: () => void;
};

type ToolbarItem = {
  label: string;
  icon: typeof RotateCcw;
  disabled: boolean;
  active?: boolean;
  onClick?: () => void;
};

export function ViewerToolbar({
  simplified = false,
  isGridVisible,
  hasParts,
  hasSelectedPart,
  partActionsDisabled = false,
  onResetCamera,
  onShowAll,
  onHideSelected,
  onIsolateSelected,
  onToggleGrid,
  onFitModel
}: ViewerToolbarProps) {
  const {t}=useTranslation();
  const toolbarItems: ToolbarItem[] = [
    {
      label: t("viewer.reset"),
      icon: RotateCcw,
      disabled: false,
      onClick: onResetCamera,
    },
    {
      label: t("viewer.fit"),
      icon: Focus,
      disabled: !hasParts,
      onClick: onFitModel,
    },
    {
      label: t("viewer.showAll"),
      icon: Eye,
      disabled: !hasParts,
      onClick: onShowAll,
    },
    {
      label: t("viewer.hideSelected"),
      icon: EyeOff,
      disabled: !hasSelectedPart || partActionsDisabled,
      onClick: onHideSelected,
    },
    {
      label: t("viewer.isolate"),
      icon: Scan,
      disabled: !hasSelectedPart || partActionsDisabled,
      onClick: onIsolateSelected,
    },
    {
      label: t("viewer.grid"),
      icon: Grid3X3,
      disabled: false,
      active: isGridVisible,
      onClick: onToggleGrid,
    },
    {
      label: t("viewer.fullscreen"),
      icon: Maximize,
      disabled: true,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/70 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {toolbarItems.filter((_, index) => !simplified || index < 2).map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              title={item.label}
              aria-label={item.label}
              aria-pressed={
                item.label === t("viewer.grid")
                  ? item.active
                  : undefined
              }
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                item.disabled
                  ? "cursor-not-allowed text-neutral-700"
                  : item.active
                    ? "cursor-pointer bg-orange-400/15 text-orange-300 hover:bg-orange-400/20"
                    : "cursor-pointer text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
