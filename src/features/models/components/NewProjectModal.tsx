"use client";

import {
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_PROJECT_COLOR,
  MATERIAL_OPTIONS,
  PRINTER_TYPE_OPTIONS,
} from "../constants/project.constants";
import { useCreateProject } from "../hooks/useCreateProject";
import type {
  PrinterType,
  ProjectMaterial,
} from "../types/Project";
import { ModelImportFlow } from "@/features/model-import/components/ModelImportFlow";
import { useModelImport } from "@/features/model-import/hooks/useModelImport";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useImportTransform } from "@/features/model-import/hooks/useImportTransform";
import { ImportTransformPanel } from "@/features/model-import/components/ImportTransformPanel";
import { OrientationSuggestionBanner } from "@/features/model-import/components/OrientationSuggestionBanner";
import { ImportUnitsPanel } from "@/features/model-import/components/ImportUnitsPanel";
import { useImportUnits } from "@/features/model-import/hooks/useImportUnits";
import { ImportTransformPreviewProvider } from "@/features/model-import/context/ImportTransformPreviewContext";
import { createTransformedGlbFile } from "@/features/model-import/lib/createTransformedGlbFile";
import type { ImportPreviewCapture } from "@/features/model-import/context/ImportTransformPreviewContext";
import { useSaveProjectThumbnail } from "../hooks/useSaveProjectThumbnail";
import { createThumbnailBlob } from "../lib/createThumbnailBlob";
import { ModelImportStepper, type ImportStepId } from "@/features/model-import/components/ModelImportStepper";
import { ModelImportFinalSummary } from "@/features/model-import/components/ModelImportFinalSummary";
import { getModelGuideCapabilities } from "@/features/model-import/lib/getModelGuideCapabilities";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { buildInitialProjectParts } from "../lib/buildInitialProjectParts";
import { isValidProjectImport } from "../lib/validateProjectImport";

type NewProjectModalProps = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onThumbnailWarning?: () => void;
};

type FormErrors = {
  name?: string;
  file?: string;
  submit?: string;
};

const INITIAL_PRINTER_TYPE: PrinterType = "fdm";
const INITIAL_MATERIAL: ProjectMaterial = "pla";

export function NewProjectModal({
  userId,
  isOpen,
  onClose,
  onThumbnailWarning,
}: NewProjectModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const createProjectMutation = useCreateProject(userId);
  const modelImport = useModelImport();
  const importTransform = useImportTransform(modelImport.analysis, modelImport.orientationSuggestion);
  const saveThumbnail = useSaveProjectThumbnail();
  const importPreviewCaptureRef = useRef<ImportPreviewCapture | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [printerType, setPrinterType] =
    useState<PrinterType>(INITIAL_PRINTER_TYPE);
  const [material, setMaterial] =
    useState<ProjectMaterial>(INITIAL_MATERIAL);
  const [baseColor, setBaseColor] = useState(
    DEFAULT_PROJECT_COLOR,
  );
  const [file, setFile] = useState<File | null>(null);
  const [hasConfirmedHeavyModel, setHasConfirmedHeavyModel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [creationStage,setCreationStage]=useState<"idle"|"creating"|"thumbnail"|"opening">("idle");
  const [showDiscardConfirmation,setShowDiscardConfirmation]=useState(false);
  const includedMeshUuids=useMemo(()=>new Set(modelImport.reviewedParts.filter(part=>part.includeInProject).map(part=>part.meshUuid)),[modelImport.reviewedParts]);
  const importUnits = useImportUnits(modelImport.analysis, modelImport.importedModel?.scene??null, importTransform.transform, includedMeshUuids);

  const isSubmitting = createProjectMutation.isPending || creationStage !== "idle";
  const isAnalysisRunning = modelImport.status === "reading" || modelImport.status === "parsing" || modelImport.status === "analyzing";
  const isAnalysisReady = modelImport.status === "review" && modelImport.analysis !== null && modelImport.errors.length === 0 && modelImport.reviewedPartsValid && importUnits.modelUnits !== null && importUnits.originalDimensions !== null && (modelImport.analysis.performanceLevel !== "very-heavy" || hasConfirmedHeavyModel);
  const currentStep:ImportStepId=!file?(name.trim()?"model":"details"):isAnalysisRunning?"analysis":modelImport.status!=="review"?"model":isAnalysisReady?"review":"parts";
  const availableSteps=useMemo(()=>new Set<ImportStepId>(["details","model",...(file?["analysis" as const]:[]),...(modelImport.status==="review"?["parts" as const,"adjust" as const]:[]),...(isAnalysisReady?["review" as const]:[])]),[file,isAnalysisReady,modelImport.status]);
  const guideCapabilities=useMemo(()=>modelImport.importedModel?getModelGuideCapabilities({formatCapabilities:modelImport.importedModel.capabilities,includedPartsCount:modelImport.reviewedParts.filter(part=>part.includeInProject).length}):[],[modelImport.importedModel,modelImport.reviewedParts]);
  const hasMeaningfulChanges=Boolean(name||description||file);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        if(hasMeaningfulChanges)setShowDiscardConfirmation(true);else onClose();
      }
      if(event.key==="Tab"&&dialogRef.current){const elements=[...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element=>element.offsetParent!==null);if(!elements.length)return;const first=elements[0],last=elements[elements.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const focusFrame=requestAnimationFrame(()=>{if(dialogRef.current&&!dialogRef.current.contains(document.activeElement))dialogRef.current.querySelector<HTMLElement>('input:not([disabled]),button:not([disabled])')?.focus();});

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [hasMeaningfulChanges, isOpen, isSubmitting, onClose]);

  function resetForm() {
    setName("");
    setDescription("");
    setPrinterType(INITIAL_PRINTER_TYPE);
    setMaterial(INITIAL_MATERIAL);
    setBaseColor(DEFAULT_PROJECT_COLOR);
    setFile(null);
    setHasConfirmedHeavyModel(false);
    modelImport.resetImport();
    importTransform.resetSession();
    importUnits.reset();
    setUploadProgress(0);
    setErrors({});
    setCreationStage("idle");
    createProjectMutation.reset();
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    if(hasMeaningfulChanges){setShowDiscardConfirmation(true);return;}
    resetForm();onClose();
  }
  function confirmClose(){setShowDiscardConfirmation(false);resetForm();onClose();}
  function scrollToStep(step:ImportStepId){const ids:Record<ImportStepId,string>={details:"project-details-section",model:"model-file-section",analysis:"import-step-analysis",parts:"import-step-parts",adjust:"import-transform-panel",review:"import-step-review"};document.getElementById(ids[step])?.scrollIntoView({behavior:"smooth",block:"start"});}

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = t("modelImport.form.nameRequired");
    } else if (name.trim().length > 80) {
      nextErrors.name = t("modelImport.form.nameTooLong");
    }

    if (!file) {
      nextErrors.file = t("modelImport.validation.fileMissing");
    } else if (isAnalysisRunning) {
      nextErrors.file = t("modelImport.validation.analysisInProgress");
    } else if (modelImport.status === "error") {
      nextErrors.file = t("modelImport.validation.analysisFailed");
    } else if (!isAnalysisReady) {
      nextErrors.file = !modelImport.reviewedParts.some(part=>part.includeInProject) ? t("modelImport.partsReview.validation.none") : modelImport.reviewedParts.some(part=>part.includeInProject&&!part.editedName.trim()) ? t("modelImport.partsReview.validation.names") : t("modelImport.validation.analysisRequired");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm() || !file || !isAnalysisReady) {
      return;
    }

    let failedStage: Exclude<typeof creationStage, "idle"> = "creating";

    try {
      setErrors({});
      setUploadProgress(0);
      setCreationStage("creating");

      if (
        !modelImport.importedModel ||
        !importUnits.modelUnits ||
        !importUnits.originalDimensions ||
        !isValidProjectImport(
          importTransform.transform,
          importUnits.originalDimensions,
        )
      ) {
        throw new Error("invalid-import-settings");
      }

      const transformedFile = await createTransformedGlbFile(file, modelImport.importedModel, importTransform.transform);
      const createdProject=await createProjectMutation.mutateAsync({
        userId,
        name,
        description,
        printerType,
        material,
        baseColor,
        file: transformedFile,
        modelFormat: modelImport.importedModel.format,
        modelUnits: importUnits.modelUnits,
        originalDimensions: importUnits.originalDimensions,
        importSchemaVersion: 1,
        parts: buildInitialProjectParts(modelImport.reviewedParts),
        onUploadProgress: setUploadProgress,
      });

      failedStage = "thumbnail";
      setCreationStage("thumbnail");
      try{const capture=importPreviewCaptureRef.current;if(!capture)throw new Error("Preview unavailable");const dataUrl=await capture();const image=await createThumbnailBlob(dataUrl);const now=new Date();await saveThumbnail.mutateAsync({projectId:createdProject.id,...image,createdAt:now,updatedAt:now});}catch(error){onThumbnailWarning?.();if(process.env.NODE_ENV!=="production")console.error("Project created, but its initial thumbnail could not be saved.",error);}
      failedStage = "opening";
      setCreationStage("opening");

      resetForm();
      onClose();
      router.push(`/models/${createdProject.id}`);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`Project creation failed during the ${failedStage} stage.`, error);
      }
      setCreationStage("idle");
      setErrors({
        submit:
          error instanceof Error && error.message === "invalid-import-settings"
            ? t("modelImport.form.invalidSettings")
            : t("modelImport.form.createFailed"),
      });
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[1.75rem] border border-[var(--border)] bg-[var(--bg)] shadow-2xl sm:max-h-[92vh] sm:rounded-[1.75rem]"
      >
        <header className="shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-start justify-between gap-6 px-5 py-5 sm:px-8 sm:py-6">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  {t("modelImport.modal.eyebrow")}
                </span>

                <span className="h-px w-8 bg-[var(--border)]" />
              </div>

              <h2
                id="new-project-title"
                className="font-[var(--font-space-grotesk)] text-2xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-3xl"
              >
                {t("modelImport.modal.title")}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                {t("modelImport.modal.description")}
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              aria-label={t("modelImport.modal.close")}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t border-[var(--border)] px-5 py-4 sm:px-8">
            <ModelImportStepper
              current={currentStep}
              available={availableSteps}
              onSelect={scrollToStep}
            />
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
              <section
                id="project-details-section"
                className="scroll-mt-40 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
              >
                <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] font-mono text-xs font-semibold text-[var(--accent)]">
                      01
                    </div>

                    <div>
                      <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
                        {t("modelImport.form.projectName")}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                        {t("modelImport.modal.description")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label
                        htmlFor="project-name"
                        className="text-sm font-medium text-[var(--text)]"
                      >
                        {t("modelImport.form.projectName")}
                      </label>

                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {name.length}/80
                      </span>
                    </div>

                    <input
                      id="project-name"
                      type="text"
                      value={name}
                      disabled={isSubmitting}
                      maxLength={80}
                      placeholder={t("modelImport.form.namePlaceholder")}
                      onChange={(event) => {
                        setName(event.target.value);

                        if (errors.name) {
                          setErrors((current) => ({
                            ...current,
                            name: undefined,
                          }));
                        }
                      }}
                      className="mt-2.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[color-mix(in_srgb,var(--text-secondary)_65%,transparent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {errors.name ? (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label
                        htmlFor="project-description"
                        className="text-sm font-medium text-[var(--text)]"
                      >
                        {t("modelImport.form.description")}
                      </label>

                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {description.length}/500
                      </span>
                    </div>

                    <textarea
                      id="project-description"
                      value={description}
                      disabled={isSubmitting}
                      maxLength={500}
                      rows={3}
                      placeholder={t(
                        "modelImport.form.descriptionPlaceholder",
                      )}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      className="mt-2.5 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition placeholder:text-[color-mix(in_srgb,var(--text-secondary)_65%,transparent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="printer-type"
                        className="text-sm font-medium text-[var(--text)]"
                      >
                        {t("guide.printer")}
                      </label>

                      <select
                        id="printer-type"
                        value={printerType}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          setPrinterType(
                            event.target.value as PrinterType,
                          )
                        }
                        className="mt-2.5 w-full cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {PRINTER_TYPE_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {t(`domain.${option.value}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="project-material"
                        className="text-sm font-medium text-[var(--text)]"
                      >
                        {t("guide.material")}
                      </label>

                      <select
                        id="project-material"
                        value={material}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          setMaterial(
                            event.target.value as ProjectMaterial,
                          )
                        }
                        className="mt-2.5 w-full cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {MATERIAL_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {t(`domain.${option.value}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="base-color"
                      className="text-sm font-medium text-[var(--text)]"
                    >
                      {t("guide.baseColor")}
                    </label>

                    <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                      <input
                        id="base-color"
                        type="color"
                        value={baseColor}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          setBaseColor(event.target.value)
                        }
                        className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                      />

                      <div
                        className="h-9 w-9 shrink-0 rounded-lg border border-[var(--border)]"
                        style={{ backgroundColor: baseColor }}
                      />

                      <input
                        type="text"
                        value={baseColor}
                        disabled={isSubmitting}
                        maxLength={7}
                        onChange={(event) => {
                          const value = event.target.value;

                          if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
                            setBaseColor(value);
                          }
                        }}
                        className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase text-[var(--text)] outline-none disabled:cursor-not-allowed"
                        aria-label={t(
                          "modelImport.form.baseColorHex",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="model-file-section"
                className="scroll-mt-40 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
              >
                <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] font-mono text-xs font-semibold text-[var(--accent)]">
                      02
                    </div>

                    <div>
                      <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
                        {t("modelImport.form.modelFile")}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                        {t("modelImport.form.localStorageNotice")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <ImportTransformPreviewProvider
                    transform={importTransform.transform}
                    includedMeshUuids={includedMeshUuids}
                    captureRef={importPreviewCaptureRef}
                  >
                    {modelImport.status === "review" ? (
                      <div className="mb-4">
                        <OrientationSuggestionBanner
                          suggestion={
                            modelImport.orientationSuggestion
                          }
                          hasManualOverride={
                            importTransform.hasManualOrientationOverride
                          }
                          onReset={
                            importTransform.resetSuggestedOrientation
                          }
                          onReview={() =>
                            document
                              .getElementById(
                                "import-transform-panel",
                              )
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              })
                          }
                        />
                      </div>
                    ) : null}

                    <ModelImportFlow
                      file={file}
                      status={modelImport.status}
                      progress={modelImport.progress}
                      stage={modelImport.currentStage}
                      analysis={modelImport.analysis}
                      warnings={modelImport.warnings}
                      errors={modelImport.errors}
                      importedModel={modelImport.importedModel}
                      reviewedParts={modelImport.reviewedParts}
                      disabled={isSubmitting}
                      heavyConfirmed={hasConfirmedHeavyModel}
                      modelUnits={importUnits.modelUnits}
                      orientationConfidence={
                        modelImport.orientationSuggestion?.confidence ??
                        null
                      }
                      onFileSelected={(selectedFile) => {
                        importTransform.resetSession();
                        setFile(selectedFile);
                        setHasConfirmedHeavyModel(false);
                        setErrors((current) => ({
                          ...current,
                          file: undefined,
                        }));
                        void modelImport.startImport(selectedFile);
                      }}
                      onChooseAnother={() => {
                        importTransform.resetSession();
                        setFile(null);
                        setHasConfirmedHeavyModel(false);
                        modelImport.resetImport();
                        setErrors((current) => ({
                          ...current,
                          file: undefined,
                        }));
                      }}
                      onTryAgain={() => {
                        if (file) {
                          void modelImport.startImport(file);
                        }
                      }}
                      onCancelAnalysis={() => {
                        importTransform.resetSession();
                        modelImport.cancelImport();
                        setFile(null);
                      }}
                      onConfirmHeavy={() =>
                        setHasConfirmedHeavyModel(true)
                      }
                      onUpdatePart={modelImport.updateReviewedPart}
                      onBulkParts={modelImport.setReviewedInclusion}
                      onResetParts={modelImport.resetReviewedParts}
                      onApplySuggestedNames={
                        modelImport.applySuggestedNames
                      }
                    />

                    {modelImport.status === "review" &&
                    modelImport.analysis &&
                    importTransform.bounds ? (
                      <div
                        id="import-transform-panel"
                        className="mt-5 scroll-mt-24 space-y-5"
                      >
                        <ImportTransformPanel
                          analysis={modelImport.analysis}
                          transform={importTransform.transform}
                          bounds={importTransform.bounds}
                          onRotate={importTransform.rotate}
                          onView={importTransform.setView}
                          onResetRotation={
                            importTransform.resetRotation
                          }
                          onReset={importTransform.reset}
                          onCenter={importTransform.autoCenter}
                          onNormalize={importTransform.autoNormalize}
                        />

                        {importUnits.originalDimensions ? (
                          <ImportUnitsPanel
                            format={
                              modelImport.importedModel?.format ??
                              "glb"
                            }
                            units={importUnits.selectedUnits}
                            dimensions={
                              importUnits.displayDimensions ??
                              importUnits.originalDimensions
                            }
                            warning={importUnits.warning}
                            onChange={importUnits.selectUnit}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </ImportTransformPreviewProvider>

                  {errors.file ? (
                    <p className="mt-3 text-sm text-red-500">
                      {errors.file}
                    </p>
                  ) : null}
                </div>
              </section>

              {isAnalysisReady &&
              modelImport.analysis &&
              file &&
              importUnits.modelUnits &&
              importUnits.originalDimensions ? (
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                  <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] font-mono text-xs font-semibold text-[var(--accent-2)]">
                        03
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-[var(--font-space-grotesk)] text-base font-semibold text-[var(--text)]">
                            {t("modelImport.footer.ready")}
                          </h3>

                          <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent-2)]">
                            Ready
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                          {t("models.createProject")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <ModelImportFinalSummary
                      name={
                        name.trim() || t("projectInfo.unknown")
                      }
                      fileName={file.name}
                      printer={t(`domain.${printerType}`)}
                      material={t(`domain.${material}`)}
                      baseColor={baseColor}
                      analysis={modelImport.analysis}
                      included={
                        modelImport.reviewedParts.filter(
                          (part) => part.includeInProject,
                        ).length
                      }
                      excluded={
                        modelImport.reviewedParts.filter(
                          (part) => !part.includeInProject,
                        ).length
                      }
                      dimensions={importUnits.originalDimensions}
                      units={importUnits.modelUnits}
                      orientationAdjusted={
                        importTransform.hasManualOrientationOverride ||
                        Boolean(
                          modelImport.orientationSuggestion &&
                            modelImport.orientationSuggestion
                              .confidence !== "low",
                        )
                      }
                      warningCount={
                        modelImport.warnings.filter(
                          (warning) =>
                            warning.severity !== "info",
                        ).length
                      }
                      capabilities={guideCapabilities}
                    />
                  </div>
                </section>
              ) : null}

              {isSubmitting ? (
                <section className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[var(--card)] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]">
                        <LoaderCircle className="h-4 w-4 animate-spin text-[var(--accent)]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">
                          {creationStage === "thumbnail"
                            ? t("modelImport.thumbnail.preparing")
                            : creationStage === "opening"
                              ? t("modelImport.thumbnail.opening")
                              : t("models.creatingProject")}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                          {t(
                            "modelImport.form.localStorageNotice",
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 font-mono text-sm font-semibold text-[var(--accent)]">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="mt-5 flex h-2 gap-1 overflow-hidden">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const isFilled =
                        uploadProgress >= (index + 1) * 10;

                      return (
                        <div
                          key={index}
                          className={`h-full flex-1 rounded-sm transition ${
                            isFilled
                              ? "bg-[var(--accent)]"
                              : "bg-[var(--border)]"
                          }`}
                        />
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {errors.submit ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-500"
                >
                  {errors.submit}
                </p>
              ) : null}
            </div>
          </div>

          <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isAnalysisReady && name.trim()
                      ? "bg-[var(--accent-2)]"
                      : "bg-[var(--border)]"
                  }`}
                />

                <p className="text-xs text-[var(--text-secondary)]">
                  {isAnalysisReady && name.trim()
                    ? t("modelImport.footer.ready")
                    : t("modelImport.footer.incomplete")}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleClose}
                  className="cursor-pointer rounded-xl border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !isAnalysisReady ||
                    !name.trim()
                  }
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      {t("models.creatingProject")}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {t("models.createProject")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </footer>
        </form>

        <ConfirmationModal
          isOpen={showDiscardConfirmation}
          title={t("modelImport.discard.title")}
          description={t("modelImport.discard.description")}
          confirmLabel={t("modelImport.discard.confirm")}
          variant="danger"
          onClose={() => setShowDiscardConfirmation(false)}
          onConfirm={confirmClose}
        />
      </div>
    </div>
  );
}
