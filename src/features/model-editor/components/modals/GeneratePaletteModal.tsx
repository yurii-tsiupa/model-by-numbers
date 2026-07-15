"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  GeneratePaletteOptions,
  PaletteOptimization,
  PaletteSource,
} from "../../types/PaletteGeneration";
import { optimizationOptions } from "../../constants/paletteGeneration";
import { DEFAULT_PALETTE_GENERATION_OPTIONS } from "../../constants/defaultPaletteGenerationOptions";
import { getPaletteGenerationPreview } from "../../utils/getPaletteGenerationPreview";
import { ModelPart } from "../../types/ModelPart";

type GeneratePaletteModalProps = {
  isOpen: boolean;
  hasPalette: boolean;
  parts: ModelPart[];
  isLoading?: boolean;

  onClose: () => void;

  onGenerate: (
    options: GeneratePaletteOptions,
  ) => void;
};

export function GeneratePaletteModal({
  isOpen,
  hasPalette,
  parts,
  isLoading = false,
  onClose,
  onGenerate,
}: GeneratePaletteModalProps) {
  const [source, setSource] =
    useState<PaletteSource>(
      DEFAULT_PALETTE_GENERATION_OPTIONS.source,
    );

  const [optimization, setOptimization] =
    useState<PaletteOptimization>(
      DEFAULT_PALETTE_GENERATION_OPTIONS.optimization,
    );

  const resetOptions = useCallback(() => {
    setSource(DEFAULT_PALETTE_GENERATION_OPTIONS.source);
    setOptimization(
      DEFAULT_PALETTE_GENERATION_OPTIONS.optimization,
    );
  }, []);

  const preview = useMemo(
    () =>
      getPaletteGenerationPreview(
        parts,
        {
          source,
          optimization,
        },
      ),
    [optimization, parts, source],
  );

  const canGenerate =
    parts.length > 0 && !isLoading;

  const handleClose = useCallback(() => {
    resetOptions();
    onClose();
  }, [onClose, resetOptions]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        handleClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [handleClose, isLoading, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!isLoading) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white">
            Generate Palette
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            {hasPalette
              ? "This will replace your current palette and reassign all model parts."
              : "Create a painting palette from the model."}
          </p>
        </div>

        <div className="space-y-8 p-6">
          <section>
            <h3 className="text-sm font-medium text-white">
              Palette Source
            </h3>

            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  setSource("original")
                }
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  source === "original"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <p className="font-medium text-white">
                  Original Material Colors
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                  Generate the palette from
                  original model materials.
                </p>
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-white">
              Optimization
            </h3>

            <div className="mt-4 space-y-3">
              {optimizationOptions.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setOptimization(
                        option.value,
                      )
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      optimization ===
                      option.value
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">
                        {option.title}
                      </p>

                      <div
                        className={`h-4 w-4 rounded-full border ${
                          optimization ===
                          option.value
                            ? "border-orange-500 bg-orange-500"
                            : "border-neutral-500"
                        }`}
                      />
                    </div>

                    <p className="mt-2 text-sm text-neutral-400">
                      {option.description}
                    </p>
                  </button>
                ),
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-white">
              Estimated result
            </h3>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-xs text-neutral-600">
                  Original
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {preview.originalColorCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-xs text-neutral-600">
                  Generated
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {preview.generatedColorCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-xs text-neutral-600">
                  Merged
                </p>

                <p className="mt-2 text-xl font-semibold text-orange-300">
                  {preview.mergedColorCount}
                </p>
              </div>
            </div>

            {parts.length === 0 ? (
              <p className="mt-3 text-xs leading-5 text-red-400">
                No model parts are available for palette
                generation.
              </p>
            ) : preview.mergedColorCount === 0 &&
              optimization !== "none" ? (
              <p className="mt-3 text-xs leading-5 text-neutral-500">
                The model colors are already sufficiently
                different for this optimization level.
              </p>
            ) : null}
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => {
              if (!canGenerate) {
                return;
              }

              onGenerate({
                source,
                optimization,
              });
            }}
            className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}