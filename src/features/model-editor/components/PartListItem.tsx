import { Eye } from "lucide-react";

type PartListItemProps = {
  index: number;
  name: string;
  isSelected?: boolean;
  isVisible?: boolean;
  onSelect?: () => void;
  onToggleVisibility?: () => void;
};

export function PartListItem({
  index,
  name,
  isSelected = false,
  isVisible = true,
  onSelect,
  onToggleVisibility,
}: PartListItemProps) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        isSelected
          ? "border-orange-400/30 bg-orange-400/10"
          : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-medium ${
            isSelected
              ? "bg-orange-400/15 text-orange-300"
              : "bg-white/[0.04] text-neutral-500"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className={`truncate text-sm ${
            isSelected
              ? "text-white"
              : "text-neutral-400"
          }`}
        >
          {name}
        </span>
      </button>

      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={
          isVisible ? `Hide ${name}` : `Show ${name}`
        }
        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition ${
          isVisible
            ? "text-neutral-500 hover:bg-white/[0.05] hover:text-white"
            : "text-neutral-700 hover:bg-white/[0.05] hover:text-neutral-400"
        }`}
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );
}