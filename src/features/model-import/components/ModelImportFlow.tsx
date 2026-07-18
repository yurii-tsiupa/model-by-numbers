"use client";

import { FileBox, UploadCloud } from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import type { ImportedModel } from "../types/ImportedModel";
import type { ModelAnalysis } from "../types/ModelAnalysis";
import type { ModelImportError } from "../types/ModelImportError";
import type { ModelImportStatus } from "../types/ModelImportStatus";
import type { ModelImportWarning } from "../types/ModelImportWarning";
import type { ModelUnits } from "../types/ModelUnits";
import type { OrientationConfidence } from "../types/OrientationSuggestion";
import type { ReviewedDetectedModelPart } from "../types/ReviewedDetectedModelPart";
import { ModelImportProgress } from "./ModelImportProgress";
import { ModelImportReport } from "./ModelImportReport";
import { ModelPartsReview } from "./ModelPartsReview";

type Props = {
  file: File | null;
  status: ModelImportStatus;
  progress: number;
  stage: string;
  analysis: ModelAnalysis | null;
  warnings: ModelImportWarning[];
  errors: ModelImportError[];
  importedModel: ImportedModel | null;
  reviewedParts: ReviewedDetectedModelPart[];
  modelUnits: ModelUnits | null;
  orientationConfidence: OrientationConfidence | null;
  disabled?: boolean;
  heavyConfirmed: boolean;
  onFileSelected: (file: File) => void;
  onChooseAnother: () => void;
  onTryAgain: () => void;
  onCancelAnalysis: () => void;
  onConfirmHeavy: () => void;
  onUpdatePart: (
    id: string,
    changes: Partial<
      Pick<
        ReviewedDetectedModelPart,
        "includeInProject" | "editedName"
      >
    >,
  ) => void;
  onBulkParts: (ids: string[], included: boolean) => void;
  onResetParts: () => void;
  onApplySuggestedNames: () => void;
};

export function ModelImportFlow(props: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const {
    file,
    status,
    progress,
    stage,
    analysis,
    errors,
    importedModel,
    reviewedParts,
    modelUnits,
    orientationConfidence,
    disabled,
    heavyConfirmed,
  } = props;

  const busy =
    status === "reading" ||
    status === "parsing" ||
    status === "analyzing";

  const needsHeavyConfirmation =
    status === "review" &&
    analysis?.performanceLevel === "very-heavy" &&
    !heavyConfirmed;

  const format =
    analysis?.format ??
    (file?.name.toLowerCase().endsWith(".stl")
      ? "stl"
      : "glb");

  const statusKey =
    status === "error"
      ? "failed"
      : busy
        ? "analyzing"
        : status === "review"
          ? "ready"
          : "validating";

  function select(selectedFile?: File) {
    if (selectedFile) {
      props.onFileSelected(selectedFile);
    }
  }

  function change(event: ChangeEvent<HTMLInputElement>) {
    select(event.target.files?.[0]);
    event.target.value = "";
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (!disabled && !busy) {
      select(event.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        aria-label={t("modelImport.upload.filePickerLabel")}
        accept=".glb,.stl,model/gltf-binary,model/stl,application/sla,application/vnd.ms-pki.stl,application/octet-stream"
        disabled={disabled || busy}
        onChange={change}
        className="hidden"
      />

      {!file ? (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={drop}
          className={`
            relative overflow-hidden rounded-2xl border border-dashed
            px-6 py-10 text-center transition
            sm:px-10 sm:py-12
            ${
              dragging
                ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_7%,var(--bg))]"
                : "border-[var(--border)] bg-[var(--bg)]"
            }
          `}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 flex h-4 flex-col gap-1"
          >
            <span className="h-px w-full bg-[color-mix(in_srgb,var(--accent)_32%,transparent)]" />
            <span className="mx-auto h-px w-[92%] bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]" />
            <span className="mx-auto h-px w-[84%] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" />
          </div>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--accent)]">
            <UploadCloud className="h-5 w-5" />
          </div>

          <h4 className="mt-4 font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
            {t("modelImport.empty.drop")}
          </h4>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            {t("modelImport.empty.chooseDescription")}
          </p>

          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("modelImport.empty.browseButton")}
          </button>

          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            <span>{t("modelImport.formats.supported")}</span>
            <span aria-hidden="true">•</span>
            <span>{t("modelImport.empty.maximumSize")}</span>
          </div>
        </div>
      ) : (
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className={`
                  flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                  border
                  ${
                    status === "review"
                      ? "border-[color-mix(in_srgb,var(--accent-2)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_8%,var(--card))] text-[var(--accent-2)]"
                      : status === "error"
                        ? "border-red-500/25 bg-red-500/5 text-red-500"
                        : "border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_7%,var(--card))] text-[var(--accent)]"
                  }
                `}
              >
                <FileBox className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {file.name}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                    {t(`modelImport.formats.${format}`)}
                  </span>

                  <span
                    role="status"
                    className={`
                      rounded-md px-2 py-1 font-mono text-[9px] font-medium
                      uppercase tracking-[0.1em]
                      ${
                        status === "error"
                          ? "bg-red-500/10 text-red-500"
                          : status === "review"
                            ? "bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] text-[var(--accent-2)]"
                            : "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]"
                      }
                    `}
                  >
                    {t(`modelImport.fileStatus.${statusKey}`)}
                  </span>

                  <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={props.onChooseAnother}
              disabled={busy || disabled}
              className="cursor-pointer self-start rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {t("modelImport.actions.chooseAnother")}
            </button>
          </div>
        </article>
      )}

      {busy ? (
        <ModelImportProgress
          progress={progress}
          stage={stage}
          onCancel={props.onCancelAnalysis}
        />
      ) : null}

      {status === "review" && analysis ? (
        <div
          id="import-step-analysis"
          className="scroll-mt-40"
        >
          <ModelImportReport
            analysis={analysis}
            modelUnits={modelUnits}
            orientationConfidence={orientationConfidence}
            onChooseAnother={props.onChooseAnother}
          />
        </div>
      ) : null}

      {status === "review" && importedModel ? (
        <div
          id="import-step-parts"
          className="scroll-mt-40 space-y-4"
        >
          {format === "stl" ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex shrink-0 flex-col gap-1">
                  <span className="h-1 w-4 rounded-full bg-[var(--accent)]" />
                  <span className="h-1 w-3 rounded-full bg-[color-mix(in_srgb,var(--accent)_60%,transparent)]" />
                  <span className="h-1 w-2 rounded-full bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]" />
                </div>

                <div className="space-y-2 text-xs leading-5 text-[var(--text-secondary)]">
                  <p>{t("modelImport.stl.singleMeshNotice")}</p>
                  <p>{t("modelImport.stl.unitsNotice")}</p>
                </div>
              </div>
            </div>
          ) : null}

          <ModelPartsReview
            parts={reviewedParts}
            scene={importedModel.scene}
            onUpdate={props.onUpdatePart}
            onBulk={props.onBulkParts}
            onReset={props.onResetParts}
            onApplySuggested={props.onApplySuggestedNames}
          />
        </div>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/25 bg-red-500/5 p-4 sm:p-5"
        >
          <div className="space-y-2">
            {errors.map((error, index) => (
              <p
                key={`${error.code}-${index}`}
                className="text-sm leading-5 text-red-500"
              >
                {t(error.messageKey)}
              </p>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={props.onTryAgain}
              className="cursor-pointer rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
            >
              {t("modelImport.actions.tryAgain")}
            </button>

            <button
              type="button"
              onClick={props.onChooseAnother}
              className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]"
            >
              {t("modelImport.actions.chooseAnother")}
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmationModal
        isOpen={needsHeavyConfirmation}
        title={t("modelImport.confirmations.heavyTitle")}
        description={t(
          "modelImport.confirmations.heavyDescription",
        )}
        confirmLabel={t(
          "modelImport.actions.continueAnyway",
        )}
        onClose={props.onChooseAnother}
        onConfirm={props.onConfirmHeavy}
      />
    </div>
  );
}