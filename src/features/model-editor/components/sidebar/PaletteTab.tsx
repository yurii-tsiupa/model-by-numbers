"use client";

import {
  Check,
  Edit3,
  Layers3,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { normalizeHexColor } from "../../lib/normalizeHexColor";
import { useModelEditorStore } from "../../store/modelEditorStore";
import { GeneratePaletteModal } from "../modals/GeneratePaletteModal";
import { DEFAULT_PALETTE_GENERATION_OPTIONS } from "../../constants/defaultPaletteGenerationOptions";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatCount } from "@/features/i18n/lib/i18n";

export function PaletteTab() {
  const {t,locale}=useTranslation();
  const palette = useModelEditorStore(
    (state) => state.palette,
  );

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const highlightedPaletteColorId =
    useModelEditorStore(
      (state) =>
        state.highlightedPaletteColorId,
    );

  const addPaletteColor =
    useModelEditorStore(
      (state) => state.addPaletteColor,
    );

  const updatePaletteColor =
    useModelEditorStore(
      (state) =>
        state.updatePaletteColor,
    );

  const deletePaletteColor =
    useModelEditorStore(
      (state) =>
        state.deletePaletteColor,
    );

  const highlightPaletteColor =
    useModelEditorStore(
      (state) =>
        state.highlightPaletteColor,
    );


  const selectionMode = useModelEditorStore(
    (state) => state.selectionMode,
  );

  const selectedPartIds = useModelEditorStore(
    (state) => state.selectedPartIds,
  );

  const startAssignPaletteMode = useModelEditorStore(
    (state) => state.startAssignPaletteMode,
  );

  const cancelAssignPaletteMode = useModelEditorStore(
    (state) => state.cancelAssignPaletteMode,
  );

  const applyPaletteColorToSelection = useModelEditorStore(
    (state) => state.applyPaletteColorToSelection,
  );

  const generatePalette =
    useModelEditorStore(
      (state) => state.generatePalette,
    );

  const [isAddingColor, setIsAddingColor] =
    useState(false);

  const [editingColorId, setEditingColorId] =
    useState<string | null>(null);

  const [draftName, setDraftName] =
    useState("");

  const [draftHex, setDraftHex] =
    useState("#FFFFFF");

  const [assignPaletteColorId, setAssignPaletteColorId] =
    useState<string | null>(null);

  const [isGeneratePaletteModalOpen, setIsGeneratePaletteModalOpen] =
    useState(false);
    

  const usageByColorId = useMemo(() => {
    const usage = new Map<string, number>();

    parts.forEach((part) => {
      if (!part.paletteColorId) {
        return;
      }

      usage.set(
        part.paletteColorId,
        (usage.get(part.paletteColorId) ??
          0) + 1,
      );
    });

    return usage;
  }, [parts]);

  const editingColor = useMemo(
    () =>
      palette.find(
        (color) =>
          color.id === editingColorId,
      ) ?? null,
    [editingColorId, palette],
  );

  function openAddColor() {
    setEditingColorId(null);

    setDraftName("");
    setDraftHex("#F97316");

    setIsAddingColor(true);
  }

  function closeForm() {
    setIsAddingColor(false);
    setEditingColorId(null);
  }

  function handleCreateColor() {
    const normalizedHex =
      normalizeHexColor(draftHex);

    if (!normalizedHex) {
      return;
    }

    addPaletteColor({
      name: draftName,
      hex: normalizedHex,
    });

    closeForm();
  }

  function handleSaveEdit() {
    if (!editingColor) {
      return;
    }

    const normalizedHex =
      normalizeHexColor(draftHex);

    if (!normalizedHex) {
      return;
    }

    updatePaletteColor(editingColor.id, {
      name: draftName,
      hex: normalizedHex,
    });

    closeForm();
  }

  const isFormOpen =
    isAddingColor || Boolean(editingColor);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
              {t("palette.projectColors")}
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              {t("editor.tabs.palette")}
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-neutral-500">
            {palette.length}
          </span>
        </div>

        <button
          type="button"
          onClick={openAddColor}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          {t("palette.addColor")}
        </button>

        <button
          type="button"
          onClick={() => {
            if (palette.length === 0) {
              generatePalette(DEFAULT_PALETTE_GENERATION_OPTIONS);

              return;
            }

            setIsGeneratePaletteModalOpen(true);
          }}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-500/10 bg-orange-500/[0.03] px-4 py-2.5 text-sm font-medium text-orange-400 transition hover:border-orange-500/25 hover:bg-orange-500/[0.08] hover:text-orange-300 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          {t("palette.generate")}
        </button>
      </div>

      {selectionMode === "assignPalette" && (
        <div className="border-b border-orange-500/20 bg-gradient-to-r from-orange-500/[0.08] to-transparent p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Layers3 className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-300">
                {t("palette.assignColor")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">
                {t("palette.selectedParts",{count:selectedPartIds.length})}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                cancelAssignPaletteMode();
                setAssignPaletteColorId(null);
              }}
              className="cursor-pointer rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-200"
            >
              {t("common.cancel")}
            </button>

            <button
              type="button"
              disabled={
                selectedPartIds.length === 0 ||
                !assignPaletteColorId
              }
              onClick={() => {
                if (!assignPaletteColorId) {
                  return;
                }

                applyPaletteColorToSelection(
                  assignPaletteColorId,
                );

                setAssignPaletteColorId(null);
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-semibold text-neutral-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
              {t("palette.apply")}
            </button>
          </div>
        </div>
      )}

      {isFormOpen ? (
        <div className="shrink-0 border-b border-white/10 p-3">
          <div className="rounded-xl border border-orange-400/25 bg-orange-400/[0.06] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">
                {isAddingColor
                  ? t("palette.newColor")
                  : t("palette.editColor")}
              </p>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition hover:bg-white/[0.05] hover:text-white"
                aria-label={t("palette.closeForm")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="color"
                value={draftHex}
                onChange={(event) =>
                  setDraftHex(
                    event.target.value,
                  )
                }
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
              />

              <input
                type="text"
                value={draftName}
                onChange={(event) =>
                  setDraftName(
                    event.target.value,
                  )
                }
                placeholder={t("palette.colorName")}
                className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-neutral-700 focus:border-white/20"
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={draftHex}
                onChange={(event) =>
                  setDraftHex(
                    event.target.value,
                  )
                }
                className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 font-mono text-xs uppercase text-neutral-400 outline-none focus:border-white/20"
              />

              <button
                type="button"
                onClick={
                  isAddingColor
                    ? handleCreateColor
                    : handleSaveEdit
                }
                className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-orange-400 px-3 text-xs font-semibold text-neutral-950 transition hover:bg-orange-300"
              >
                <Check className="h-4 w-4" />

                {isAddingColor
                  ? t("palette.add")
                  : t("editor.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {palette.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <div className="max-w-52 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Palette className="h-5 w-5 text-neutral-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-neutral-400">
              {t("palette.noPalette")}
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-600">
              {t("palette.noPaletteHelp")}
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2">
            {palette.map((color) => {
              const usageCount =
                usageByColorId.get(color.id) ??
                0;

              const isHighlighted =
                highlightedPaletteColorId ===
                color.id;

              return (
                <div
                  key={color.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    highlightPaletteColor(
                      color.id,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      highlightPaletteColor(
                        color.id,
                      );
                    }
                  }}
                  className={`w-full cursor-pointer rounded-xl border px-3 py-3 text-left transition ${
                    isHighlighted
                      ? "border-orange-400/30 bg-orange-400/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-10 w-10 shrink-0 rounded-xl border border-white/15"
                      style={{
                        backgroundColor:
                          color.hex,
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

                      <span className="mt-1 block text-xs text-neutral-500">
                        {formatCount(locale,usageCount,"part")}
                      </span>
                    </span>

                    {isHighlighted ? (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-400 text-neutral-950">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <button
                      type="button"
                      disabled={selectionMode === "assignPalette"}
                      onClick={(event) => {
                        event.stopPropagation();

                        setAssignPaletteColorId(color.id);
                        startAssignPaletteMode();
                      }}
                      className="flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-orange-400/20 bg-orange-400/5 px-3 text-xs font-semibold text-orange-400 transition hover:border-orange-400/40 hover:bg-orange-400/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-transparent disabled:text-neutral-700"
                    >
                      <Layers3 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t("palette.assignParts")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        setIsAddingColor(false);

                        setEditingColorId(color.id);

                        setDraftName(color.name);
                        setDraftHex(color.hex);
                      }}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-neutral-500 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                      aria-label={t("palette.editNamed",{name:color.name})}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={usageCount > 0}
                      onClick={(event) => {
                        event.stopPropagation();

                        deletePaletteColor(
                          color.id,
                        );
                      }}
                      title={
                        usageCount > 0
                          ? t("palette.usedBy",{count:formatCount(locale,usageCount,"part")})
                          : t("palette.deleteColor")
                      }
                      aria-label={t("palette.deleteNamed",{name:color.name})}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-neutral-600 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-neutral-800 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <GeneratePaletteModal
        isOpen={isGeneratePaletteModalOpen}
        hasPalette={palette.length > 0}
        parts={parts}
        onClose={() =>
          setIsGeneratePaletteModalOpen(false)
        }
        onGenerate={(options) => {
          generatePalette(options);
          setIsGeneratePaletteModalOpen(false);
        }}
      />
    </div>
  );
}
