"use client";

import {
  Paintbrush,
  RotateCcw,
} from "lucide-react";
import { useMemo } from "react";

import { PAINT_COLORS } from "../constants/paintColors";
import { useModelEditorStore } from "../store/modelEditorStore";

export function PropertiesPanel() {
  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const selectedPartId = useModelEditorStore(
    (state) => state.selectedPartId,
  );

  const assignPartColor =
    useModelEditorStore(
      (state) => state.assignPartColor,
    );

  const resetPartColor =
    useModelEditorStore(
      (state) => state.resetPartColor,
    );

  const selectedPart = useMemo(
    () =>
      parts.find(
        (part) =>
          part.id === selectedPartId,
      ) ?? null,
    [parts, selectedPartId],
  );

  return (
    <aside className="flex max-h-[22rem] min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-white/10 bg-neutral-950/70 lg:h-full lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
      <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
          Properties
        </p>

        <h2 className="mt-2 truncate text-lg font-semibold text-white">
          {selectedPart
            ? selectedPart.name
            : "No selection"}
        </h2>

        <p className="mt-1 text-xs text-neutral-600">
          {selectedPart
            ? `Part ${String(
                selectedPart.index + 1,
              ).padStart(2, "0")}`
            : "Select a model part to edit it."}
        </p>
      </div>

      {!selectedPart ? (
        <div className="flex min-h-44 flex-1 items-center justify-center p-5">
          <div className="max-w-48 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Paintbrush className="h-5 w-5 text-neutral-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-neutral-400">
              Select a part
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Choose a model part from the
              sidebar or directly in the viewer.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">
                Paint color
              </p>

              {selectedPart.color ? (
                <button
                  type="button"
                  onClick={() =>
                    resetPartColor(
                      selectedPart.id,
                    )
                  }
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-500 transition hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              ) : null}
            </div>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Choose a color for this model
              part.
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {PAINT_COLORS.map((color) => {
                const isSelected =
                  selectedPart.color ===
                  color.value;

                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      assignPartColor(
                        selectedPart.id,
                        color.value,
                      )
                    }
                    title={color.name}
                    aria-label={`Set ${color.name} color`}
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
                        <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.65)]" />
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
              Custom color
            </label>
            
            {selectedPart.originalColor ? (
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
                    Original material color
                  </span>
                </div>

                <span className="shrink-0 font-mono text-xs uppercase text-neutral-400">
                  {selectedPart.originalColor}
                </span>
              </div>
            ) : null}

            <div className="mt-3 flex items-center gap-3">
              <input
                id="custom-part-color"
                type="color"
                value={
                  selectedPart.color ??
                  selectedPart.originalColor ??
                  "#f97316"
                }
                onChange={(event) =>
                  assignPartColor(
                    selectedPart.id,
                    event.target.value,
                  )
                }
                className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-1"
              />

              <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.025] px-3">
                <span className="truncate font-mono text-xs uppercase text-neutral-400">
                  {selectedPart.color ??
                    selectedPart.originalColor ??
                    "Original material"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}