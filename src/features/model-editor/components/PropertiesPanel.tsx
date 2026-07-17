"use client";

import {
  Check,
  Paintbrush,
  Plus,
  RotateCcw,
  WandSparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { PAINT_COLORS } from "../constants/paintColors";
import { normalizeHexColor } from "../lib/normalizeHexColor";
import { useModelEditorStore } from "../store/modelEditorStore";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { PaintingWorkflowSection } from "./painting/PaintingWorkflowSection";

export function PropertiesPanel() {
  const {t}=useTranslation();
  const [customColor, setCustomColor] =
    useState("#f97316");

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );

  const selectedPartId = useModelEditorStore(
    (state) => state.selectedPartId,
  );

  const assignPaletteColor = useModelEditorStore(
    (state) => state.assignPaletteColor,
  );

  const createAndAssignPaletteColor =
    useModelEditorStore(
      (state) =>
        state.createAndAssignPaletteColor,
    );

  const clearPaletteColor = useModelEditorStore(
    (state) => state.clearPaletteColor,
  );

  const syncPaletteFromParts = useModelEditorStore(
    (state) => state.syncPaletteFromParts,
  );

  const selectedPart = useMemo(
    () =>
      parts.find(
        (part) => part.id === selectedPartId,
      ) ?? null,
    [parts, selectedPartId],
  );

  const selectedPaletteColor = useMemo(() => {
    if (!selectedPart?.paletteColorId) {
      return null;
    }

    return (
      palette.find(
        (color) =>
          color.id ===
          selectedPart.paletteColorId,
      ) ?? null
    );
  }, [palette, selectedPart]);

  const legacyPaintedPartsCount = useMemo(
    () =>
      parts.filter(
        (part) =>
          Boolean(part.color) &&
          !part.paletteColorId,
      ).length,
    [parts],
  );

  useEffect(() => {
    const nextColor =
      selectedPaletteColor?.hex ??
      selectedPart?.originalColor ??
      "#f97316";

    queueMicrotask(() => setCustomColor(nextColor));
  }, [
    selectedPaletteColor?.hex,
    selectedPart?.id,
    selectedPart?.originalColor,
  ]);

  function handleApplyCustomColor() {
    if (!selectedPart) {
      return;
    }

    const normalizedColor =
      normalizeHexColor(customColor);

    if (!normalizedColor) {
      return;
    }

    createAndAssignPaletteColor(
      selectedPart.id,
      normalizedColor,
    );
  }

  return (
    <aside className="flex max-h-[22rem] min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-white/10 bg-neutral-950/70 lg:h-full lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
      <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
          {t("properties.title")}
        </p>

        <h2 className="mt-2 truncate text-lg font-semibold text-white">
          {selectedPart
            ? selectedPart.name
            : t("properties.noSelection")}
        </h2>

        <p className="mt-1 text-xs text-neutral-600">
          {selectedPart
            ? t("properties.partNumber",{number:String(selectedPart.index + 1).padStart(2,"0")})
            : t("properties.selectPart")}
        </p>

        {legacyPaintedPartsCount > 0 ? (
          <button
            type="button"
            onClick={syncPaletteFromParts}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-2.5 text-sm font-medium text-orange-300 transition hover:bg-orange-400/15"
          >
            <WandSparkles className="h-4 w-4" />
            {t("palette.generate")}
          </button>
        ) : null}
      </div>

      {!selectedPart ? (
        <div className="flex min-h-44 flex-1 items-center justify-center p-5">
          <div className="max-w-48 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Paintbrush className="h-5 w-5 text-neutral-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-neutral-400">
              {t("properties.selectTitle")}
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              {t("properties.selectHelp")}
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {t("properties.projectPalette")}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  {t("properties.assignHelp")}
                </p>
              </div>

              {selectedPaletteColor ||
              selectedPart.color ? (
                <button
                  type="button"
                  onClick={() =>
                    clearPaletteColor(
                      selectedPart.id,
                    )
                  }
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-neutral-500 transition hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("properties.clear")}
                </button>
              ) : null}
            </div>

            {palette.length > 0 ? (
              <div className="mt-4 space-y-2">
                {palette.map((color) => {
                  const isSelected =
                    selectedPart.paletteColorId ===
                    color.id;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() =>
                        assignPaletteColor(
                          selectedPart.id,
                          color.id,
                        )
                      }
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "border-orange-400/30 bg-orange-400/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className="h-8 w-8 shrink-0 rounded-lg border border-white/15"
                        style={{
                          backgroundColor: color.hex,
                        }}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-neutral-200">
                          {String(
                            color.number,
                          ).padStart(2, "0")}
                          {" — "}
                          {color.name}
                        </span>

                        <span className="mt-0.5 block font-mono text-[11px] uppercase text-neutral-600">
                          {color.hex}
                        </span>
                      </span>

                      {isSelected ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-400 text-neutral-950">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
                <p className="text-sm text-neutral-500">
                  {t("palette.empty")}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-700">
                  {t("palette.emptyHelp")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-sm font-medium text-white">
              {t("properties.quick")}
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              {t("properties.quickHelp")}
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {PAINT_COLORS.map((color) => {
                const normalizedPreset =
                  normalizeHexColor(color.value);

                const isSelected =
                  normalizedPreset !== null &&
                  normalizeHexColor(
                    selectedPaletteColor?.hex ?? "",
                  ) === normalizedPreset;

                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      createAndAssignPaletteColor(
                        selectedPart.id,
                        color.value,
                      )
                    }
                    title={t(`color.${color.id}`)}
                    aria-label={t("properties.useColor",{name:t(`color.${color.id}`)})}
                    aria-pressed={isSelected}
                    className={`relative aspect-square cursor-pointer rounded-xl border p-1 transition ${
                      isSelected
                        ? "border-orange-400 ring-2 ring-orange-400/20"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <span
                      className="block h-full w-full rounded-lg border border-black/10"
                      style={{
                        backgroundColor:
                          color.value,
                      }}
                    />

                    {isSelected ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <label
              htmlFor="custom-part-color"
              className="text-sm font-medium text-white"
            >
              {t("properties.custom")}
            </label>

            <div className="mt-3 flex items-center gap-2">
              <input
                id="custom-part-color"
                type="color"
                value={customColor}
                onChange={(event) =>
                  setCustomColor(
                    event.target.value,
                  )
                }
                className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-1"
              />

              <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.025] px-3">
                <span className="truncate font-mono text-xs uppercase text-neutral-400">
                  {normalizeHexColor(customColor) ??
                    customColor}
                </span>
              </div>

              <button
                type="button"
                onClick={handleApplyCustomColor}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 text-neutral-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                aria-label={t("properties.addColor")}
                title={t("properties.addColorTitle")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {selectedPaletteColor ? (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm font-medium text-white">
                {t("properties.assigned")}
              </p>

              <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3">
                <span
                  className="h-8 w-8 shrink-0 rounded-lg border border-white/15"
                  style={{
                    backgroundColor:
                      selectedPaletteColor.hex,
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-300">
                    {selectedPaletteColor.name}
                  </p>

                  <p className="mt-0.5 font-mono text-[11px] uppercase text-neutral-600">
                    {selectedPaletteColor.hex}
                  </p>
                </div>

                <span className="text-xs font-medium text-neutral-500">
                  C
                  {String(
                    selectedPaletteColor.number,
                  ).padStart(2, "0")}
                </span>
              </div>
            </div>
          ) : null}

          {selectedPart.originalColor ? (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm font-medium text-white">
                {t("properties.originalMaterial")}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-white/20"
                    style={{
                      backgroundColor:
                        selectedPart.originalColor,
                    }}
                  />

                  <span className="truncate text-xs text-neutral-500">
                    {t("properties.materialBase")}
                  </span>
                </div>

                <span className="shrink-0 font-mono text-xs uppercase text-neutral-400">
                  {selectedPart.originalColor}
                </span>
              </div>
            </div>
          ) : null}
          <PaintingWorkflowSection part={selectedPart} />
        </div>
      )}
    </aside>
  );
}
