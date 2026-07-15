"use client";

import {
  Eye,
  EyeOff,
  FileCheck2,
} from "lucide-react";
import {
  type MouseEvent,
  useEffect,
  useRef,
} from "react";

type PartListItemProps = {
  index: number;
  name: string;
  isSelected?: boolean;
  isVisible?: boolean;
  isIncludedInGuide?: boolean;
  color?: string | null;
  onSelect?: () => void;
  onToggleVisibility?: () => void;
  onToggleGuideInclusion?: () => void;
};

export function PartListItem({
  index,
  name,
  isSelected = false,
  isVisible = true,
  isIncludedInGuide = true,
  color = null,
  onSelect,
  onToggleVisibility,
  onToggleGuideInclusion,
}: PartListItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    itemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [isSelected]);

  function handleToggleVisibility(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    onToggleVisibility?.();
  }

  function handleToggleGuideInclusion(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onToggleGuideInclusion?.();
  }

  const VisibilityIcon = isVisible ? Eye : EyeOff;

  return (
    <div
      ref={itemRef}
      className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        isSelected
          ? "border-orange-400/30 bg-orange-400/10"
          : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
      }`}
    >
      <button
        type="button"
        onClick={handleToggleGuideInclusion}
        aria-label={isIncludedInGuide ? `Exclude ${name} from guide` : `Include ${name} in guide`}
        title={isIncludedInGuide ? "Exclude from guide" : "Include in guide"}
        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition ${isIncludedInGuide ? "text-orange-400 hover:bg-orange-400/10" : "text-neutral-700 hover:bg-white/[0.05] hover:text-neutral-400"}`}
      >
        <FileCheck2 className="h-4 w-4" />
      </button>

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

        <span className="flex min-w-0 flex-1 items-center gap-2">
          {color ? (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
              style={{
                backgroundColor: color,
              }}
            />
          ) : null}

          <span
            className={`truncate text-sm ${
              isSelected
                ? "text-white"
                : isVisible
                  ? "text-neutral-400"
                  : "text-neutral-700"
            }`}
            title={name}
          >
            {name}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={handleToggleVisibility}
        aria-label={
          isVisible ? `Hide ${name}` : `Show ${name}`
        }
        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition ${
          isVisible
            ? "text-neutral-500 hover:bg-white/[0.05] hover:text-white"
            : "text-neutral-700 hover:bg-white/[0.05] hover:text-neutral-400"
        }`}
      >
        <VisibilityIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
