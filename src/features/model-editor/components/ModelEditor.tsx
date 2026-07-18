"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { GuideCaptureOverlay } from "@/features/guides/components/GuideCaptureOverlay";
import { useGuideGenerationStore } from "@/features/guides/store/guideGenerationStore";
import type { GuideImages } from "@/features/guides/types/ModelGuide";
import type { Project } from "@/features/models/types/Project";
import { useProjectThumbnail } from "@/features/models/hooks/useProjectThumbnail";
import { useSaveProjectThumbnail } from "@/features/models/hooks/useSaveProjectThumbnail";
import { createThumbnailBlob } from "@/features/models/lib/createThumbnailBlob";
import { useReferenceImages } from "@/features/references/hooks/useReferenceImages";
import { ReferenceSplitPanel } from "@/features/references/components/ReferenceSplitPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import { useProjectAutosave } from "../hooks/useProjectAutosave";
import { getGuideReadiness } from "../lib/getGuideReadiness";
import { useModelEditorStore } from "../store/modelEditorStore";
import { EditorHeader } from "./EditorHeader";
import { ModelViewer } from "./ModelViewer";
import type { ModelViewerHandle } from "./ModelViewer";
import { PropertiesPanel } from "./PropertiesPanel";
import { EditorSidebar } from "./EditorSidebar";
import { EditorModeSwitch } from "./EditorModeSwitch";
import { GuideBuilderPanel } from "./GuideBuilderPanel";
import { useEditorMode } from "../hooks/useEditorMode";
import type { AssemblyStep } from "@/features/models/types/AssemblyStep";
import { deleteAssemblyStepImage, saveAssemblyStepImage } from "../services/assemblyStepImage.service";
import { getAssemblyStepImage } from "../services/assemblyStepImage.service";
import { blobToDataUrl } from "@/features/guides/lib/blobToDataUrl";
import type { GuideAssemblyStep, GuideSettings } from "@/features/guides/types/ModelGuide";
import { PAINTING_GUIDE_SETTINGS } from "@/features/guides/lib/guideSettings";
import { GuideSettingsModal } from "@/features/guides/components/GuideSettingsModal";
import {getAssemblyGuideReadiness} from "@/features/guides/lib/getAssemblyGuideReadiness";
import { imageSourceToBlob, saveGuideAsset } from "@/features/guides/services/assets/saveGuideAsset";
import type { GuideAssetReference } from "@/features/guides/services/assets/types";
import { registerStepPreviewGenerator } from "../step-previews/stepPreviewService";

type ModelEditorProps = {
  project: Project;
  userId: string;
};

export function ModelEditor({
  project,
  userId,
}: ModelEditorProps) {
  const router = useRouter();
  const {locale,t}=useTranslation();
  const { mode, setMode } = useEditorMode();
  const initializedProjectIdRef = useRef<string | null>(null);
  const hydratePaintingOrder=useModelEditorStore(state=>state.hydratePaintingOrder);
  const viewerRef = useRef<ModelViewerHandle | null>(null);
  const isGeneratingRef = useRef(false);
  const autoThumbnailAttemptedRef = useRef(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [showGuideSettings,setShowGuideSettings]=useState(false);
  const [lastGuideSettings,setLastGuideSettings]=useState<GuideSettings|null>(null);
  const thumbnailQuery = useProjectThumbnail(project.id);
  const saveThumbnail = useSaveProjectThumbnail();
  const [referenceViewMode,setReferenceViewMode]=useState<"viewer"|"split"|"reference">("viewer");
  const [selectedReferenceId,setSelectedReferenceId]=useState<string|null>(null);
  const referencesQuery=useReferenceImages(project.id);
  const references=referencesQuery.data??[];
  const selectedReference=references.find(reference=>reference.id===selectedReferenceId)??null;
  const effectiveReferenceViewMode=selectedReference?referenceViewMode:"viewer";

  useEffect(() => registerStepPreviewGenerator(project.id, async (stepId) => { const viewer=viewerRef.current;if(!viewer)throw new Error("modelUnavailable");return viewer.generateStepPreview(stepId); }), [project.id]);

  function focusAssemblyStep(stepId: string) {
    useModelEditorStore.getState().focusAssemblyStep(stepId);
    window.setTimeout(() => viewerRef.current?.fitView(), 450);
  }
  function exitAssemblyFocus() { useModelEditorStore.getState().exitAssemblyStepFocus(); }
  async function captureAssemblyImage(step:AssemblyStep){const viewer=viewerRef.current;if(!viewer)throw new Error("Viewer unavailable");const blob=await viewer.captureAssemblyStep({partIds:step.partIds,labelsMode:"numbers-and-names"});const extension=blob.type==="image/webp"?"webp":"png";let stored;try{stored=await saveAssemblyStepImage({projectId:project.id,stepId:step.id,blob,fileName:`assembly-step-${step.order}.${extension}`});}catch{throw new Error("assembly-save-failed");}if(!useModelEditorStore.getState().assemblySteps.some(item=>item.id===step.id)){await deleteAssemblyStepImage(project.id,step.id);throw new Error("Step unavailable");}useModelEditorStore.getState().setAssemblyStepImageKey(step.id,stored.key);return blob;}
  async function deleteAssemblyImage(step:AssemblyStep){await deleteAssemblyStepImage(project.id,step.id);useModelEditorStore.getState().setAssemblyStepImageKey(step.id,null);}
  async function deleteAssemblyStepWithImage(step:AssemblyStep){if(useModelEditorStore.getState().focusedAssemblyStepId===step.id)useModelEditorStore.getState().exitAssemblyStepFocus();if(step.imageKey)await deleteAssemblyStepImage(project.id,step.id);useModelEditorStore.getState().deleteAssemblyStep(step.id);}

  function openReferenceMode(mode: "split" | "reference", preferredReferenceId?: string) {
    const preferredReference = preferredReferenceId ? references.find((reference) => reference.id === preferredReferenceId) : null;
    const currentReference = references.find((reference) => reference.id === selectedReferenceId);
    const nextReference = preferredReference ?? currentReference ?? references[0];
    if (!nextReference) { setSelectedReferenceId(null); setReferenceViewMode("viewer"); return; }
    setSelectedReferenceId(nextReference.id);
    setReferenceViewMode(mode);
  }

  function handleReferenceDeleted(referenceId: string) {
    if (selectedReferenceId !== referenceId) return;
    const deletedIndex = references.findIndex((reference) => reference.id === referenceId);
    const remaining = references.filter((reference) => reference.id !== referenceId);
    const nextReference = remaining[Math.min(Math.max(deletedIndex, 0), remaining.length - 1)];
    if (nextReference) setSelectedReferenceId(nextReference.id);
    else { setSelectedReferenceId(null); setReferenceViewMode("viewer"); }
  }

  const generationStatus = useGuideGenerationStore(
    (state) => state.status,
  );
  const startCapture = useGuideGenerationStore(
    (state) => state.startCapture,
  );
  const setCaptureStep = useGuideGenerationStore(
    (state) => state.setCaptureStep,
  );
  const setImages = useGuideGenerationStore(
    (state) => state.setImages,
  );
  const setGenerationError = useGuideGenerationStore(
    (state) => state.setError,
  );
  const setGuideExtras=useGuideGenerationStore(state=>state.setGuideExtras);
  const resetGuideGeneration = useGuideGenerationStore(
    (state) => state.reset,
  );

  const resetEditor = useModelEditorStore(
    (state) => state.resetEditor,
  );

  const setPalette = useModelEditorStore(
    (state) => state.setPalette,
  );
  const setAssemblySteps = useModelEditorStore((state) => state.setAssemblySteps);
  const setManualDetails=useModelEditorStore(state=>state.setManualDetails);

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );
  const assemblySteps=useModelEditorStore(state=>state.assemblySteps);

  const isDirty = useModelEditorStore(
    (state) => state.isDirty,
  );

  const saveStatus = useModelEditorStore(
    (state) => state.saveStatus,
  );

  const readiness = useMemo(
    () =>
      getGuideReadiness({
        project,
        parts,
        palette,
        locale,
      }),
    [locale,palette, parts, project],
  );

  const isGuideReady =
    readiness.isReady &&
    !isDirty &&
    saveStatus === "saved";

  const generateThumbnail = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer || saveThumbnail.isPending) return;
    setThumbnailError(null);
    try {
      const source = await viewer.captureView("painted");
      const image = await createThumbnailBlob(source);
      const now = new Date();
      await saveThumbnail.mutateAsync({ projectId: project.id, ...image, createdAt: thumbnailQuery.data?.createdAt ?? now, updatedAt: now });
    } catch {
      setThumbnailError(t("editor.thumbnailFailed"));
    }
  }, [project.id, saveThumbnail, t, thumbnailQuery.data]);

  useEffect(() => {
    if (autoThumbnailAttemptedRef.current || thumbnailQuery.isLoading || thumbnailQuery.data || parts.length === 0) return;
    autoThumbnailAttemptedRef.current = true;
    void generateThumbnail();
  }, [generateThumbnail, parts.length, thumbnailQuery.data, thumbnailQuery.isLoading]);

  async function generateGuidePreview(settings:GuideSettings) {
    if (isGeneratingRef.current) {
      return;
    }

    const viewer = viewerRef.current;
    const editorState = useModelEditorStore.getState();
    const currentReadiness = getGuideReadiness({
      project,
      parts: editorState.parts,
      palette: editorState.palette,
      locale,
    });

    if (
      !currentReadiness.isReady ||
      editorState.isDirty ||
      editorState.saveStatus !== "saved"
    ) {
      return;
    }
    if(!getAssemblyGuideReadiness({settings,assemblySteps:editorState.assemblySteps,parts:editorState.parts}).isReady){startCapture(project.id,1);setGenerationError(t("guide.errors.assemblyInvalid"));return;}

    if (!viewer) {
      startCapture(project.id);
      setGenerationError(
        t("editor.viewerNotReady"),
      );
      return;
    }

    const paintingSteps=([] as Array<keyof GuideImages>);if(settings.includeOriginalView)paintingSteps.push("original");if(settings.includeBaseView)paintingSteps.push("base");if(settings.includePaintedView)paintingSteps.push("painted");if(settings.includeNumbersView)paintingSteps.push("numbers");
    const totalSteps=paintingSteps.length+(settings.includeExplodedView?1:0)+(settings.includeAssemblyInstructions&&settings.includeAssemblyStepImages?1:0);
    isGeneratingRef.current = true;
    startCapture(project.id,totalSteps);

    const images: GuideImages = {
      original: null,
      base: null,
      painted: null,
      numbers: null,
    };
    const assetReferences: GuideAssetReference[] = [];

    try {
      let progress=0;
      for (const step of paintingSteps) {
        setCaptureStep(step, ++progress);
        images[step] = await viewer.captureView(step);
        const source = images[step];
        if (source) assetReferences.push(await saveGuideAsset({ projectId: project.id, kind: `model-${step}`, assetId: "current", blob: await imageSourceToBlob(source) }));
      }
      let explodedView=null;
      const includedParts=editorState.parts.filter(part=>part.includeInGuide);
      if(settings.includeExplodedView){setCaptureStep("exploded",++progress);const blob=await viewer.captureAssemblyStep({partIds:includedParts.map(part=>part.id),labelsMode:"numbers-and-names"});explodedView={image:await blobToDataUrl(blob),labelsMode:"numbers-and-names" as const,partsCount:includedParts.length};assetReferences.push(await saveGuideAsset({projectId:project.id,kind:"exploded",assetId:"current",blob}));}
      const assemblyGuideSteps:GuideAssemblyStep[]=[];
      if(settings.includeAssemblyInstructions){if(settings.includeAssemblyStepImages)setCaptureStep("assembly-assets",++progress);const partById=new Map(editorState.parts.map(part=>[part.id,part]));for(const step of editorState.assemblySteps.slice().sort((a,b)=>a.order-b.order)){const resolved=step.partIds.map(id=>partById.get(id)).filter((part):part is NonNullable<typeof part>=>Boolean(part));if(!step.title.trim()||resolved.length===0)continue;let image:string|null=null;if(settings.includeAssemblyStepImages&&step.imageKey){try{const blob=await getAssemblyStepImage(project.id,step.id);if(blob)image=await blobToDataUrl(blob);}catch{image=null;}}assemblyGuideSteps.push({id:step.id,order:step.order,title:step.title.trim(),description:step.description.trim(),parts:resolved.map(part=>({id:part.id,number:part.index+1,name:part.name})),image});}}
      for(const step of assemblyGuideSteps){if(step.image)assetReferences.push(await saveGuideAsset({projectId:project.id,kind:"assembly",assetId:step.id,blob:await imageSourceToBlob(step.image)}));}
      setGuideExtras(settings,explodedView,assemblyGuideSteps,assetReferences);
      setImages(project.id, images);
      router.push(`/models/${project.id}/guide`);
    } catch (error) {
      console.error("Failed to prepare guide preview:", error);
      setGenerationError(
        t("editor.captureFailed"),
      );
    } finally {
      isGeneratingRef.current = false;
    }
  }

  const { saveNow } = useProjectAutosave({
    projectId: project.id,
    userId,
  });

  useEffect(() => {
    if (initializedProjectIdRef.current === project.id) {
      return;
    }

    resetEditor();
    hydratePaintingOrder(project.paintingOrder);
    setPalette(project.palette);
    setAssemblySteps(project.assemblySteps);
    setManualDetails(project.manualDetails,project.nextManualDetailNumber);

    initializedProjectIdRef.current = project.id;
  }, [
    project.id,
    project.palette,
    resetEditor,
    setPalette,
    setAssemblySteps,
    setManualDetails,
    hydratePaintingOrder,
    project.paintingOrder,
    project.assemblySteps,
    project.manualDetails,
    project.nextManualDetailNumber,
  ]);

  useEffect(() => {
    return () => {
      initializedProjectIdRef.current = null;
      resetEditor();
    };
  }, [resetEditor]);

  const canExplode=parts.filter(part=>part.includeInGuide).length>=2;
  const canAssemble=assemblySteps.some(step=>step.title.trim()&&step.partIds.some(id=>parts.some(part=>part.id===id)));
  const defaultSettings:GuideSettings={...PAINTING_GUIDE_SETTINGS,includeExplodedView:canExplode,includeAssemblyInstructions:canAssemble,includeAssemblyStepImages:canAssemble};

  return (
    <main data-editor-ui className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <EditorHeader
        project={project}
        isGuideReady={isGuideReady}
        isGeneratingGuide={generationStatus === "capturing"}
        onGenerateGuide={() => {
          setShowGuideSettings(true);
        }}
        onSave={() => {
          void saveNow();
        }}
      />

      <EditorModeSwitch mode={mode} onChange={setMode} />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {mode === "advanced" ? <EditorSidebar key="advanced-sidebar" guideSettings={lastGuideSettings??defaultSettings} project={project} isGeneratingThumbnail={saveThumbnail.isPending} thumbnailError={thumbnailError} onRegenerateThumbnail={() => { void generateThumbnail(); }} onOpenReferenceMode={openReferenceMode} onReferenceDeleted={handleReferenceDeleted} onFocusAssemblyStep={focusAssemblyStep} onExitAssemblyFocus={exitAssemblyFocus} onCaptureAssemblyImage={captureAssemblyImage} onDeleteAssemblyImage={deleteAssemblyImage} onDeleteAssemblyStep={deleteAssemblyStepWithImage} /> : null}

        <div key="viewer-area" className="relative flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
          <div className={`${mode === "advanced" && effectiveReferenceViewMode==="reference"?"hidden":"flex"} min-h-[18rem] min-w-0 flex-1`}><ModelViewer ref={viewerRef} project={project} userId={userId} simplified={mode === "simple"} /></div>
          {mode === "advanced"&&selectedReference&&effectiveReferenceViewMode!=="viewer"?<ReferenceSplitPanel reference={selectedReference} references={references} onSelect={setSelectedReferenceId} onClose={()=>setReferenceViewMode("viewer")}/>:null}
          {mode === "advanced" ? <div className="absolute right-3 top-3 z-20 flex rounded-full border border-white/10 bg-black/70 p-1 text-xs">{(["viewer","split","reference"] as const).map(viewMode=><button key={viewMode} type="button" disabled={viewMode!=="viewer"&&references.length===0} onClick={()=>{if(viewMode==="viewer")setReferenceViewMode("viewer");else openReferenceMode(viewMode);}} className={`rounded-full px-3 py-1.5 disabled:opacity-40 ${effectiveReferenceViewMode===viewMode?"bg-orange-400 text-black":"text-neutral-300"}`}>{viewMode==="viewer"?t("viewer.model"):viewMode==="split"?t("viewer.split"):t("viewer.reference")}</button>)}</div> : null}
          {mode === "simple" ? <GuideBuilderPanel projectId={project.id} canOpenGuide={isGuideReady} onOpenGuide={() => setShowGuideSettings(true)} /> : null}
        </div>

        {mode === "advanced" ? <PropertiesPanel key="advanced-properties" /> : null}
      </div>

      <GuideCaptureOverlay
        onRetry={() => {
          if(lastGuideSettings)void generateGuidePreview(lastGuideSettings);
        }}
        onCancel={resetGuideGeneration}
      />
      {showGuideSettings?<GuideSettingsModal initial={lastGuideSettings??defaultSettings} canExplode={canExplode} canAssemble={canAssemble} onClose={()=>setShowGuideSettings(false)} onConfirm={settings=>{setShowGuideSettings(false);setLastGuideSettings(settings);void generateGuidePreview(settings);}}/>:null}
    </main>
  );
}
