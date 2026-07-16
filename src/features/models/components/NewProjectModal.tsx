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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
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
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70 sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-neutral-950/95 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-sm font-medium text-orange-400">
              {t("modelImport.modal.eyebrow")}
            </p>

            <h2
              id="new-project-title"
              className="mt-1 text-2xl font-semibold tracking-tight text-white"
            >
              {t("modelImport.modal.title")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {t("modelImport.modal.description")}
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            aria-label={t("modelImport.modal.close")}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 bg-neutral-950/90 px-6 pb-4 sm:px-8"><ModelImportStepper current={currentStep} available={availableSteps} onSelect={scrollToStep}/></div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
            <div id="project-details-section" className="scroll-mt-40">
              <label
                htmlFor="project-name"
                className="text-sm font-medium text-neutral-200"
              >
                {t("modelImport.form.projectName")}
              </label>

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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-orange-400/50 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 flex justify-between gap-4">
                {errors.name ? (
                  <p className="text-sm text-red-400">
                    {errors.name}
                  </p>
                ) : (
                  <span />
                )}

                <span className="shrink-0 text-xs text-neutral-600">
                  {name.length}/80
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="text-sm font-medium text-neutral-200"
              >
                {t("modelImport.form.description")}
              </label>

              <textarea
                id="project-description"
                value={description}
                disabled={isSubmitting}
                maxLength={500}
                rows={4}
                placeholder={t("modelImport.form.descriptionPlaceholder")}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-orange-400/50 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-right text-xs text-neutral-600">
                {description.length}/500
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="printer-type"
                  className="text-sm font-medium text-neutral-200"
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
                  className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/50 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="text-sm font-medium text-neutral-200"
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
                  className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/50 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="text-sm font-medium text-neutral-200"
              >
                {t("guide.baseColor")}
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
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
                  className="h-9 w-9 rounded-full border border-white/15"
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
                  className="min-w-0 flex-1 bg-transparent text-sm uppercase text-white outline-none disabled:cursor-not-allowed"
                  aria-label={t("modelImport.form.baseColorHex")}
                />
              </div>
            </div>

            <div id="model-file-section" className="scroll-mt-40">
              <p className="mb-2 text-sm font-medium text-neutral-200">
                {t("modelImport.form.modelFile")}
              </p>

              <ImportTransformPreviewProvider transform={importTransform.transform} includedMeshUuids={includedMeshUuids} captureRef={importPreviewCaptureRef}>{modelImport.status==="review"?<OrientationSuggestionBanner suggestion={modelImport.orientationSuggestion} hasManualOverride={importTransform.hasManualOrientationOverride} onReset={importTransform.resetSuggestedOrientation} onReview={()=>document.getElementById("import-transform-panel")?.scrollIntoView({behavior:"smooth",block:"start"})}/>:null}<ModelImportFlow
                file={file} status={modelImport.status} progress={modelImport.progress} stage={modelImport.currentStage} analysis={modelImport.analysis} warnings={modelImport.warnings} errors={modelImport.errors} importedModel={modelImport.importedModel} reviewedParts={modelImport.reviewedParts} disabled={isSubmitting} heavyConfirmed={hasConfirmedHeavyModel}
                modelUnits={importUnits.modelUnits} orientationConfidence={modelImport.orientationSuggestion?.confidence??null}
                onFileSelected={(selectedFile) => { importTransform.resetSession(); setFile(selectedFile); setHasConfirmedHeavyModel(false); setErrors(current => ({ ...current, file: undefined })); void modelImport.startImport(selectedFile); }}
                onChooseAnother={() => { importTransform.resetSession(); setFile(null); setHasConfirmedHeavyModel(false); modelImport.resetImport(); setErrors(current => ({ ...current, file: undefined })); }}
                onTryAgain={() => { if (file) void modelImport.startImport(file); }}
                onCancelAnalysis={() => { importTransform.resetSession(); modelImport.cancelImport(); setFile(null); }}
                onConfirmHeavy={() => setHasConfirmedHeavyModel(true)}
                onUpdatePart={modelImport.updateReviewedPart} onBulkParts={modelImport.setReviewedInclusion} onResetParts={modelImport.resetReviewedParts} onApplySuggestedNames={modelImport.applySuggestedNames}
              />{modelImport.status==="review"&&modelImport.analysis&&importTransform.bounds?<div id="import-transform-panel" className="scroll-mt-24"><ImportTransformPanel analysis={modelImport.analysis} transform={importTransform.transform} bounds={importTransform.bounds} onRotate={importTransform.rotate} onView={importTransform.setView} onResetRotation={importTransform.resetRotation} onReset={importTransform.reset} onCenter={importTransform.autoCenter} onNormalize={importTransform.autoNormalize}/>{importUnits.originalDimensions?<ImportUnitsPanel format={modelImport.importedModel?.format??"glb"} units={importUnits.selectedUnits} dimensions={importUnits.displayDimensions??importUnits.originalDimensions} warning={importUnits.warning} onChange={importUnits.selectUnit}/>:null}</div>:null}</ImportTransformPreviewProvider>
              {errors.file ? <p className="mt-2 text-sm text-red-400">{errors.file}</p> : null}
            </div>

            {isAnalysisReady&&modelImport.analysis&&file&&importUnits.modelUnits&&importUnits.originalDimensions?<ModelImportFinalSummary name={name.trim()||t("projectInfo.unknown")} fileName={file.name} printer={t(`domain.${printerType}`)} material={t(`domain.${material}`)} baseColor={baseColor} analysis={modelImport.analysis} included={modelImport.reviewedParts.filter(part=>part.includeInProject).length} excluded={modelImport.reviewedParts.filter(part=>!part.includeInProject).length} dimensions={importUnits.originalDimensions} units={importUnits.modelUnits} orientationAdjusted={importTransform.hasManualOrientationOverride||Boolean(modelImport.orientationSuggestion&&modelImport.orientationSuggestion.confidence!=="low")} warningCount={modelImport.warnings.filter(warning=>warning.severity!=="info").length} capabilities={guideCapabilities}/>:null}

            {isSubmitting ? (
              <div className="rounded-2xl border border-orange-400/15 bg-orange-400/[0.05] p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2 text-neutral-300">
                    <LoaderCircle className="h-4 w-4 animate-spin text-orange-400" />
                    {creationStage==="thumbnail"?t("modelImport.thumbnail.preparing"):creationStage==="opening"?t("modelImport.thumbnail.opening"):t("models.creatingProject")}
                  </span>

                  <span className="font-medium text-orange-400">
                    {uploadProgress}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-[width] duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  {t("modelImport.form.localStorageNotice")}
                </p>
              </div>
            ) : null}

            {errors.submit ? (
              <p
                role="alert"
                className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-400"
              >
                {errors.submit}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/95 px-6 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-xs text-neutral-500">{isAnalysisReady&&name.trim()?t("modelImport.footer.ready"):t("modelImport.footer.incomplete")}</p><div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="cursor-pointer rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isAnalysisReady || !name.trim()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
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
        </form>
        <ConfirmationModal isOpen={showDiscardConfirmation} title={t("modelImport.discard.title")} description={t("modelImport.discard.description")} confirmLabel={t("modelImport.discard.confirm")} variant="danger" onClose={()=>setShowDiscardConfirmation(false)} onConfirm={confirmClose}/>
      </div>
    </div>
  );
}
