"use client";

import { Box, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useModelEditorStore } from "../../store/modelEditorStore";
import { PartListItem } from "../PartListItem";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function PartsTab() {
  const {t}=useTranslation();
  const filterLabels={all:t("editor.filter.all"),painted:t("editor.filter.painted"),unpainted:t("editor.filter.unpainted"),hidden:t("editor.filter.hidden"),included:t("editor.filter.included"),excluded:t("editor.filter.excluded")};
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "painted" | "unpainted" | "hidden" | "included" | "excluded">("all");

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
  const setPartIncludedInGuide = useModelEditorStore((state) => state.setPartIncludedInGuide);
  const setPartsIncludedInGuide = useModelEditorStore((state) => state.setPartsIncludedInGuide);

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

    return parts.filter((part) => {
      const matchesSearch = !normalizedQuery || part.name.toLowerCase().includes(normalizedQuery);
      const hasValidColor = Boolean(part.paletteColorId && paletteById.has(part.paletteColorId));
      const matchesFilter = filter === "all" ||
        (filter === "painted" && hasValidColor) ||
        (filter === "unpainted" && !hasValidColor) ||
        (filter === "hidden" && !part.visible) ||
        (filter === "included" && part.includeInGuide) ||
        (filter === "excluded" && !part.includeInGuide);
      return matchesSearch && matchesFilter;
    });
  }, [filter, paletteById, parts, searchQuery]);

  const hasParts = parts.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
              {t("editor.structure")}
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              {t("editor.tabs.parts")}
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
            placeholder={t("editor.searchParts")}
            disabled={!hasParts}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-9 pr-3 text-sm text-neutral-300 outline-none transition placeholder:text-neutral-700 focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["all", "painted", "unpainted", "hidden", "included", "excluded"] as const).map((option) => <button key={option} type="button" onClick={() => setFilter(option)} className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] transition ${filter === option ? "border-orange-400/30 bg-orange-400/10 text-orange-300" : "border-white/10 text-neutral-500 hover:text-neutral-300"}`}>{filterLabels[option]}</button>)}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-600">{t("editor.results",{shown:filteredParts.length,total:parts.length})}</span>
          {filteredParts.length > 0 ? <div className="flex gap-2"><button type="button" onClick={() => setPartsIncludedInGuide(filteredParts.map((part) => part.id), true)} className="cursor-pointer text-[11px] text-neutral-500 hover:text-orange-300">{t("editor.includeFiltered")}</button><button type="button" onClick={() => setPartsIncludedInGuide(filteredParts.map((part) => part.id), false)} className="cursor-pointer text-[11px] text-neutral-500 hover:text-red-300">{t("editor.excludeFiltered")}</button></div> : null}
        </div>
      </div>

      {!hasParts ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <div className="max-w-48 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Box className="h-5 w-5 text-neutral-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-neutral-400">
              {t("editor.noParts")}
            </p>
          </div>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5 text-center">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              {t("editor.noMatchingParts")}
            </p>

            <p className="mt-1 text-xs text-neutral-600">
              {t("editor.trySearch")}
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
                  isIncludedInGuide={part.includeInGuide}
                  onSelect={() =>
                    selectPart(part.id)
                  }
                  onToggleVisibility={() =>
                    togglePartVisibility(
                      part.id,
                    )
                  }
                  onToggleGuideInclusion={() => setPartIncludedInGuide(part.id, !part.includeInGuide)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
