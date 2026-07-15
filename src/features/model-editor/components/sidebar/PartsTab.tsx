"use client";

import { Box, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useModelEditorStore } from "../../store/modelEditorStore";
import { PartListItem } from "../PartListItem";

export function PartsTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );

  const selectedPartId = useModelEditorStore(
    (state) => state.selectedPartId,
  );

  const selectPart = useModelEditorStore(
    (state) => state.selectPart,
  );

  const togglePartVisibility =
    useModelEditorStore(
      (state) =>
        state.togglePartVisibility,
    );

  const paletteById = useMemo(
    () =>
      new Map(
        palette.map((color) => [
          color.id,
          color,
        ]),
      ),
    [palette],
  );

  const filteredParts = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return parts;
    }

    return parts.filter((part) =>
      part.name
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [parts, searchQuery]);

  const hasParts = parts.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
              Model Structure
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Parts
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-neutral-500">
            {parts.length}
          </span>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search parts"
            disabled={!hasParts}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-9 pr-3 text-sm text-neutral-300 outline-none transition placeholder:text-neutral-700 focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {!hasParts ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <div className="max-w-48 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Box className="h-5 w-5 text-neutral-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-neutral-400">
              No parts loaded
            </p>
          </div>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5 text-center">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              No matching parts
            </p>

            <p className="mt-1 text-xs text-neutral-600">
              Try another search term.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1">
            {filteredParts.map((part) => {
              const assignedColor =
                part.paletteColorId
                  ? paletteById.get(
                      part.paletteColorId,
                    )?.hex ?? null
                  : part.color;

              return (
                <PartListItem
                  key={part.id}
                  index={part.index}
                  name={part.name}
                  color={assignedColor}
                  isSelected={
                    selectedPartId ===
                    part.id
                  }
                  isVisible={part.visible}
                  onSelect={() =>
                    selectPart(part.id)
                  }
                  onToggleVisibility={() =>
                    togglePartVisibility(
                      part.id,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}