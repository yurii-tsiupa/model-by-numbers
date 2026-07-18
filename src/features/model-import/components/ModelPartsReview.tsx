"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Object3D } from "three";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatLocalizedNumber } from "@/features/i18n/lib/i18n";

import { MODEL_IMPORT_THRESHOLDS } from "../constants/modelImport.constants";
import type {
  ModelImportPartsFilter,
  ReviewedDetectedModelPart,
} from "../types/ReviewedDetectedModelPart";
import { ModelImportPreview } from "./ModelImportPreview";

type ModelPartsReviewProps = {
  parts: ReviewedDetectedModelPart[];
  scene: Object3D;
  onUpdate: (
    id: string,
    changes: Partial<
      Pick<
        ReviewedDetectedModelPart,
        "includeInProject" | "editedName"
      >
    >,
  ) => void;
  onBulk: (ids: string[], included: boolean) => void;
  onReset: () => void;
  onApplySuggested: () => void;
};

const FILTERS: ModelImportPartsFilter[] = [
  "all",
  "included",
  "excluded",
  "unnamed",
  "high-poly",
  "hidden",
  "nested",
];

export function ModelPartsReview({
  parts,
  scene,
  onUpdate,
  onBulk,
  onReset,
  onApplySuggested,
}: ModelPartsReviewProps) {
  const { t, locale } = useTranslation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ModelImportPartsFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    parts[0]?.id ?? null,
  );
  const [isolate, setIsolate] = useState(false);

  const selected =
    parts.find((part) => part.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return parts.filter((part) => {
      const matchesSearch =
        !query ||
        [
          part.originalName,
          part.suggestedName,
          part.editedName,
          ...part.materialNames,
          ...part.parentPath,
        ].some((value) =>
          value.toLowerCase().includes(query),
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "included" &&
          part.includeInProject) ||
        (filter === "excluded" &&
          !part.includeInProject) ||
        (filter === "unnamed" &&
          !part.originalName.trim()) ||
        (filter === "high-poly" &&
          part.trianglesCount >=
            MODEL_IMPORT_THRESHOLDS.mediumTriangles) ||
        (filter === "hidden" && !part.visible) ||
        (filter === "nested" &&
          part.parentPath.length > 1);

      return matchesSearch && matchesFilter;
    });
  }, [filter, parts, search]);

  const includedParts = parts.filter(
    (part) => part.includeInProject,
  );

  const included = includedParts.length;

  const excluded = parts.length - included;

  const renamed = parts.filter(
    (part) =>
      part.editedName.trim() !== part.suggestedName,
  ).length;

  const includedWithoutName = includedParts.filter(
    (part) => !part.editedName.trim(),
  ).length;

  const isReady =
    included > 0 && includedWithoutName === 0;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
          {t("modelImport.partsReview.title")}
        </h3>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
          {t("modelImport.partsReview.description")}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.85fr)]">
          <div className="min-w-0">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t(
                  "modelImport.partsReview.search",
                )}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {FILTERS.map((value) => {
                const active = filter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(value)}
                    className={`
                      cursor-pointer rounded-lg border px-2.5 py-1.5
                      font-mono text-[9px] font-medium uppercase
                      tracking-[0.08em] transition
                      ${
                        active
                          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                      }
                    `}
                  >
                    {t(
                      `modelImport.partsReview.filters.${value}`,
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={() =>
                  onBulk(
                    filtered.map((part) => part.id),
                    true,
                  )
                }
                className="cursor-pointer text-xs font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                {t(
                  "modelImport.partsReview.actions.includeAll",
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onBulk(
                    filtered.map((part) => part.id),
                    false,
                  )
                }
                className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text)]"
              >
                {t(
                  "modelImport.partsReview.actions.excludeAll",
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onBulk(
                    filtered
                      .filter((part) => part.visible)
                      .map((part) => part.id),
                    true,
                  )
                }
                className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text)]"
              >
                {t(
                  "modelImport.partsReview.actions.includeVisible",
                )}
              </button>

              <button
                type="button"
                onClick={onApplySuggested}
                className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text)]"
              >
                {t(
                  "modelImport.partsReview.actions.applyNames",
                )}
              </button>

              <button
                type="button"
                onClick={onReset}
                className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text)]"
              >
                {t(
                  "modelImport.partsReview.actions.reset",
                )}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-secondary)]">
                {t("modelImport.partsReview.results", {
                  count: filtered.length,
                })}
              </p>

              <p className="font-mono text-[10px] text-[var(--text-secondary)]">
                {included}/{parts.length}
              </p>
            </div>

            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
              {filtered.map((part) => {
                const active = selectedId === part.id;
                const invalidName =
                  part.includeInProject &&
                  !part.editedName.trim();

                return (
                  <div
                    key={part.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(part.id)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        setSelectedId(part.id);
                      }
                    }}
                    className={`
                      grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto]
                      items-center gap-3 rounded-xl border p-3 transition
                      ${
                        active
                          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]"
                          : "border-[var(--border)] bg-[var(--bg)] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={part.includeInProject}
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      onChange={(event) =>
                        onUpdate(part.id, {
                          includeInProject:
                            event.target.checked,
                        })
                      }
                      aria-label={t(
                        "modelImport.partsReview.columns.include",
                      )}
                      className="h-4 w-4 cursor-pointer rounded border-[var(--border)] accent-[var(--accent)]"
                    />

                    <input
                      value={part.editedName}
                      maxLength={120}
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      onChange={(event) =>
                        onUpdate(part.id, {
                          editedName: event.target.value,
                        })
                      }
                      aria-invalid={invalidName}
                      className={`
                        min-w-0 bg-transparent text-xs outline-none
                        ${
                          invalidName
                            ? "text-red-500"
                            : "text-[var(--text)]"
                        }
                      `}
                    />

                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                      {formatLocalizedNumber(
                        part.trianglesCount,
                        locale,
                      )}
                    </span>
                  </div>
                );
              })}

              {!filtered.length ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-10 text-center">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t(
                      "modelImport.partsReview.empty.noMatches",
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="min-w-0">
            {selected ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <ModelImportPreview
                    scene={scene}
                    selectedUuid={selected.meshUuid}
                    isolate={isolate}
                  />
                </div>

                <button
                  type="button"
                  aria-pressed={isolate}
                  onClick={() =>
                    setIsolate((value) => !value)
                  }
                  className={`
                    w-full cursor-pointer rounded-xl border px-3
                    py-2.5 text-xs font-medium transition
                    ${
                      isolate
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                    }
                  `}
                >
                  {isolate
                    ? t(
                        "modelImport.partsReview.preview.full",
                      )
                    : t(
                        "modelImport.partsReview.preview.isolate",
                      )}
                </button>

                <dl className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <div className="p-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                      {t(
                        "modelImport.partsReview.preview.original",
                      )}
                    </dt>
                    <dd className="mt-1 break-words text-xs text-[var(--text)]">
                      {selected.originalName ||
                        t("common.unassigned")}
                    </dd>
                  </div>

                  <div className="p-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                      {t(
                        "modelImport.partsReview.preview.type",
                      )}
                    </dt>
                    <dd className="mt-1 text-xs text-[var(--text)]">
                      {selected.meshType}
                    </dd>
                  </div>

                  <div className="p-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                      {t(
                        "modelImport.partsReview.preview.vertices",
                      )}
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-[var(--text)]">
                      {formatLocalizedNumber(
                        selected.verticesCount,
                        locale,
                      )}
                    </dd>
                  </div>

                  <div className="p-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                      {t(
                        "modelImport.partsReview.preview.materials",
                      )}
                    </dt>
                    <dd className="mt-1 break-words text-xs leading-5 text-[var(--text)]">
                      {selected.materialNames.join(", ") ||
                        t("common.unassigned")}
                    </dd>
                  </div>

                  <div className="p-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                      {t(
                        "modelImport.partsReview.preview.path",
                      )}
                    </dt>
                    <dd className="mt-1 break-all font-mono text-[10px] leading-5 text-[var(--text-secondary)]">
                      {selected.parentPath.join(" / ") ||
                        "/"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-6 text-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  {t(
                    "modelImport.partsReview.preview.unavailable",
                  )}
                </p>
              </div>
            )}
          </aside>
        </div>

        <div
          role="status"
          className={`
            mt-5 rounded-xl border px-4 py-3
            ${
              isReady
                ? "border-[color-mix(in_srgb,var(--accent-2)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_6%,var(--bg))]"
                : "border-red-500/25 bg-red-500/5"
            }
          `}
        >
          <p
            className={`
              text-xs font-medium
              ${
                isReady
                  ? "text-[var(--accent-2)]"
                  : "text-red-500"
              }
            `}
          >
            {included
              ? includedWithoutName
                ? t(
                    "modelImport.partsReview.validation.names",
                  )
                : t(
                    "modelImport.partsReview.summary.ready",
                  )
              : t(
                  "modelImport.partsReview.validation.none",
                )}
          </p>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {t("modelImport.partsReview.summary.counts", {
              included,
              excluded,
              renamed,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}