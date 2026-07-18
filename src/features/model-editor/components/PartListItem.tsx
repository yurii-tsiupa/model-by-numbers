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
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

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
  const {t}=useTranslation();
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
          ? "border-[var(--accent)] bg-[var(--bg)]"
          : "border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)]"
      }`}
    >
      <button
        type="button"
        onClick={handleToggleGuideInclusion}
        aria-label={isIncludedInGuide ? t("parts.excludeNamed",{name}) : t("parts.includeNamed",{name})}
        title={isIncludedInGuide ? t("parts.excludeGuide") : t("parts.includeGuide")}
        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition ${isIncludedInGuide ? "text-[var(--accent-2)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg)]"}`}
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
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "bg-[var(--bg)] text-[var(--text-secondary)]"
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
                ? "text-[var(--text)]"
                : isVisible
                  ? "text-[var(--text)]"
                  : "text-[var(--text-secondary)]"
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
          isVisible ? t("parts.hideNamed",{name}) : t("parts.showNamed",{name})
        }
        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition ${
          isVisible
            ? "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg)]"
        }`}
      >
        <VisibilityIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
