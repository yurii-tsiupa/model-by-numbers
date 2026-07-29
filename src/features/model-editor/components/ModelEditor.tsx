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
import { useUpdateProjectBaseColor } from "@/features/models/hooks/useUpdateProjectBaseColor";
import { normalizeHexColor } from "../lib/normalizeHexColor";
import { subscribeToBaseColorSynchronization } from "../lib/baseColorSynchronization";
import { useReferenceImages } from "@/features/references/hooks/useReferenceImages";
import { ReferenceSplitPanel } from "@/features/references/components/ReferenceSplitPanel";
import {SimpleReferenceViewer} from "@/features/references/components/SimpleReferenceViewer";
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
import { GuideBuilderPanel, SimplePalettePanel } from "./GuideBuilderPanel";
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
import {configureStepPreviewSource,getOrGenerateStepPreview} from "../step-previews/stepPreviewService";
import {getLegacyTargetModeCounts,inferSimpleTargetMode} from "../lib/simpleTargetMode";
import {getStepPreviewCacheKey} from "../step-previews/getStepPreviewCacheKey";
import {suppressManualDetailPins} from "../store/viewerOverlayStore";
import {OnboardingProvider} from "@/features/onboarding/components/OnboardingProvider";
import {ONBOARDING_TARGETS} from "@/features/onboarding/constants/onboardingTargets";
import {ManualStepPreviewCaptureContext,type ManualStepPreviewCaptureRequest} from "../step-previews/ManualStepPreviewCaptureContext";

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
  const hydrateSimplePaintingStepOrder=useModelEditorStore(state=>state.hydrateSimplePaintingStepOrder);
  const hydrateSimplePartColorAssignments=useModelEditorStore(state=>state.hydrateSimplePartColorAssignments);
  const viewerRef = useRef<ModelViewerHandle | null>(null);
  const isGeneratingRef = useRef(false);
  const restoreManualDetailPinsRef=useRef<(()=>void)|null>(null);
  const normalPreviewCameraRef=useRef<ReturnType<ModelViewerHandle["getCurrentPreviewCamera"]>>(null);
  const[captureSession,setCaptureSession]=useState<{phase:"active"|"closing";request:ManualStepPreviewCaptureRequest}|null>(null);
  const previewCapture=captureSession?.request??null;
  const previewCaptureCloseTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const addManualPreview=useModelEditorStore(state=>state.addPaintingStageManualCapture);
  const openPreviewCapture=useCallback((partId:string,step:ManualStepPreviewCaptureRequest["step"])=>{
    const camera=viewerRef.current?.getCurrentPreviewCamera()??null;
    if(!camera)return;
    if(previewCaptureCloseTimerRef.current)clearTimeout(previewCaptureCloseTimerRef.current);
    normalPreviewCameraRef.current=camera;
    setCaptureSession({phase:"active",request:{partId,step,displayMode:"current-step"}});
  },[]);
  const closePreviewCapture=useCallback(()=>{
    if(!captureSession||captureSession.phase==="closing")return;
    const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCaptureSession(current=>current?{...current,phase:"closing"}:current);
    const camera=normalPreviewCameraRef.current;
    if(camera)viewerRef.current?.setPreviewCamera(camera,reducedMotion?0:240);
    previewCaptureCloseTimerRef.current=setTimeout(()=>{
      normalPreviewCameraRef.current=null;
      setCaptureSession(null);
      previewCaptureCloseTimerRef.current=null;
    },reducedMotion?0:250);
  },[captureSession]);
  const captureManualPreview=useCallback(()=>{
    if(!previewCapture||captureSession?.phase!=="active")return;
    const camera=viewerRef.current?.getCurrentPreviewCamera()??null;
    if(!camera)return;
    addManualPreview(previewCapture.partId,previewCapture.step.id,camera,previewCapture.displayMode);
    closePreviewCapture();
  },[addManualPreview,captureSession?.phase,closePreviewCapture,previewCapture]);
  useEffect(()=>{if(!previewCapture)return;const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();closePreviewCapture()}};window.addEventListener("keydown",onKeyDown);return()=>window.removeEventListener("keydown",onKeyDown)},[closePreviewCapture,previewCapture]);
  useEffect(()=>()=>{if(previewCaptureCloseTimerRef.current)clearTimeout(previewCaptureCloseTimerRef.current)},[]);
  const autoThumbnailAttemptedRef = useRef(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [showGuideSettings,setShowGuideSettings]=useState(false);
  const [lastGuideSettings,setLastGuideSettings]=useState<GuideSettings|null>(null);
  const thumbnailQuery = useProjectThumbnail(project.id);
  const saveThumbnail = useSaveProjectThumbnail();
  const { mutate: updateProjectBaseColor, isPending: isUpdatingBaseColor } = useUpdateProjectBaseColor(project.id, userId);
  useEffect(() => subscribeToBaseColorSynchronization((baseColor) => {
    if ((normalizeHexColor(project.baseColor) ?? project.baseColor) !== baseColor) updateProjectBaseColor(baseColor);
  }), [project.baseColor, updateProjectBaseColor]);
  const [referenceViewMode,setReferenceViewMode]=useState<"viewer"|"split"|"reference">("viewer");
  const [selectedReferenceId,setSelectedReferenceId]=useState<string|null>(null);
  const [simpleReferenceOpen,setSimpleReferenceOpen]=useState(false);
  const [isDesktopReferenceLayout,setIsDesktopReferenceLayout]=useState(false);
  const referencesQuery=useReferenceImages(project.id);
  const references=referencesQuery.data??[];
  const selectedReference=references.find(reference=>reference.id===selectedReferenceId)??null;
  const effectiveReferenceViewMode=selectedReference?referenceViewMode:"viewer";

  useEffect(()=>{const media=window.matchMedia("(min-width: 1024px)"),update=()=>setIsDesktopReferenceLayout(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update)},[]);

  useEffect(()=>{configureStepPreviewSource(project.id,{userId:project.userId,modelFormat:project.modelFormat,modelVersion:`${project.originalFileSize}:${project.updatedAt.getTime()}`,baseColor:project.baseColor},()=>viewerRef.current?.getCurrentPreviewCamera()??null)},[project.baseColor,project.id,project.modelFormat,project.originalFileSize,project.updatedAt,project.userId]);

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
    else { setSelectedReferenceId(null); setReferenceViewMode("viewer"); setSimpleReferenceOpen(false); }
  }

  const showSimpleReference=useCallback((referenceId:string)=>{setSelectedReferenceId(referenceId);setSimpleReferenceOpen(true)},[]);
  const closeSimpleReference=useCallback(()=>setSimpleReferenceOpen(false),[]);
  const selectReference=useCallback((referenceId:string)=>setSelectedReferenceId(referenceId),[]);

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
  const hydrateSimpleTargetMode=useModelEditorStore(state=>state.hydrateSimpleTargetMode);

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
  const manualDetailPlacement=useModelEditorStore(state=>state.manualDetailPlacement);
  const regionPlacement=useModelEditorStore(state=>state.regionPlacement);
  const simpleTargetMode=useModelEditorStore(state=>state.simpleTargetMode);
  const editorManualDetails=useModelEditorStore(state=>state.manualDetails);

  const saveStatus = useModelEditorStore(
    (state) => state.saveStatus,
  );
  const previewCaptureUsesRegions=previewCapture?simpleTargetMode==="parts"||(previewCapture.step.targetReferences?.some(reference=>reference.type==="manualDetail"&&editorManualDetails.find(detail=>detail.id===reference.id)?.targetMode==="region")??simpleTargetMode==="region"):false;

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
      await saveThumbnail.mutateAsync({ userId, thumbnail: { projectId: project.id, ...image, baseColor: normalizeHexColor(project.baseColor) ?? project.baseColor, createdAt: thumbnailQuery.data?.createdAt ?? now, updatedAt: now } });
    } catch {
      setThumbnailError(t("editor.thumbnailFailed"));
    }
  }, [project.baseColor, project.id, saveThumbnail, t, thumbnailQuery.data, userId]);

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
    const targetedPaintingStages=editorState.parts.flatMap(part=>part.paintingWorkflow.stages).filter(stage=>Boolean(stage.targetReferences?.length)||stage.previewShots?.some(shot=>shot.type==="manualStepCapture"));
    const totalSteps=paintingSteps.length+(settings.includeExplodedView?1:0)+(settings.includeAssemblyInstructions&&settings.includeAssemblyStepImages?1:0)+(targetedPaintingStages.length?1:0);
    isGeneratingRef.current = true;
    startCapture(project.id,totalSteps);

    const images: GuideImages = {
      original: null,
      base: null,
      painted: null,
      numbers: null,
    };
    const assetReferences: GuideAssetReference[] = [];
    const restoreManualDetailPins=suppressManualDetailPins();
    restoreManualDetailPinsRef.current=restoreManualDetailPins;

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
      if(targetedPaintingStages.length){setCaptureStep("step-images",++progress);for(const stage of targetedPaintingStages){for(const shot of [...(stage.overviewPreviewEnabled!==false?[undefined]:[]),...(stage.previewShots??[])]){const cacheKey=getStepPreviewCacheKey(project.id,stage,editorState.parts,editorState.manualDetails,editorState.palette,shot);try{const preview=await getOrGenerateStepPreview(project.id,stage.id,cacheKey,false,shot);assetReferences.push(await saveGuideAsset({projectId:project.id,kind:"step-preview",assetId:shot?`${stage.id}:${shot.id}`:stage.id,contentKey:cacheKey,blob:await imageSourceToBlob(preview.imageUrl)}))}catch{/* A single unavailable close-up must not block the guide. */}}}}
      setGuideExtras(settings,explodedView,assemblyGuideSteps,assetReferences);
      setImages(project.id, images);
      router.push(`/models/${project.id}/guide`);
    } catch (error) {
      console.error("Failed to prepare guide preview:", error);
      setGenerationError(
        t("editor.captureFailed"),
      );
    } finally {
      restoreManualDetailPins();
      if(restoreManualDetailPinsRef.current===restoreManualDetailPins)restoreManualDetailPinsRef.current=null;
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
    hydrateSimplePaintingStepOrder(project.simplePaintingStepOrder);
    hydrateSimplePartColorAssignments(project.simplePartColorAssignments);
    setPalette(project.palette);
    setAssemblySteps(project.assemblySteps);
    setManualDetails(project.manualDetails,project.nextManualDetailNumber);
    const inferredMode=project.simpleTargetMode??inferSimpleTargetMode(project.manualDetails);
    const legacyCounts=getLegacyTargetModeCounts(project.manualDetails);
    const mixedLegacy=legacyCounts.markers>0&&legacyCounts.region>0;
    hydrateSimpleTargetMode(inferredMode,project.simpleTargetMode===null&&inferredMode!==null&&!mixedLegacy);

    initializedProjectIdRef.current = project.id;
  }, [
    project.id,
    project.palette,
    resetEditor,
    setPalette,
    setAssemblySteps,
    setManualDetails,
    hydratePaintingOrder,
    hydrateSimplePaintingStepOrder,
    hydrateSimplePartColorAssignments,
    project.paintingOrder,
    project.simplePaintingStepOrder,
    project.simplePartColorAssignments,
    project.assemblySteps,
    project.manualDetails,
    project.nextManualDetailNumber,
    project.simpleTargetMode,
    hydrateSimpleTargetMode,
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

  const onboardingEligible=mode==="simple"&&parts.length>0&&!isDirty&&!manualDetailPlacement&&!regionPlacement&&generationStatus!=="capturing"&&!showGuideSettings;
  return <OnboardingProvider userId={userId} simpleMode={mode==="simple"} eligible={onboardingEligible}>
    <ManualStepPreviewCaptureContext.Provider value={{request:previewCapture,open:openPreviewCapture,setDisplayMode:displayMode=>setCaptureSession(current=>current?{...current,request:{...current.request,displayMode}}:current)}}>
    <main data-editor-ui className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div inert={Boolean(previewCapture)||undefined}><EditorHeader
        project={project}
        isGuideReady={isGuideReady}
        isGeneratingGuide={generationStatus === "capturing"}
        showOnboardingHelp={mode==="simple"}
        onGenerateGuide={() => {
          setShowGuideSettings(true);
        }}
        onSave={() => {
          void saveNow();
        }}
      /></div>

      <div inert={Boolean(previewCapture)||undefined}><EditorModeSwitch mode={mode} onChange={setMode} /></div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {mode === "advanced" ? <EditorSidebar key="advanced-sidebar" guideSettings={lastGuideSettings??defaultSettings} project={project} isUpdatingBaseColor={isUpdatingBaseColor} onUpdateBaseColor={updateProjectBaseColor} isGeneratingThumbnail={saveThumbnail.isPending} thumbnailError={thumbnailError} onRegenerateThumbnail={() => { void generateThumbnail(); }} onOpenReferenceMode={openReferenceMode} onReferenceDeleted={handleReferenceDeleted} onFocusAssemblyStep={focusAssemblyStep} onExitAssemblyFocus={exitAssemblyFocus} onCaptureAssemblyImage={captureAssemblyImage} onDeleteAssemblyImage={deleteAssemblyImage} onDeleteAssemblyStep={deleteAssemblyStepWithImage} /> : null}

        {mode === "simple" ? <SimplePalettePanel captureHidden={Boolean(previewCapture)} /> : null}
        <div key="viewer-area" data-onboarding-target={mode==="simple"?ONBOARDING_TARGETS.modelViewer:undefined} className={`relative flex min-w-0 flex-1 flex-col lg:flex-row ${mode==="simple"?"order-1 min-h-[45dvh] lg:order-2 lg:min-h-0":"min-h-0"}`}>
          <div className={`${mode === "advanced" && effectiveReferenceViewMode==="reference"?"hidden":"flex"} min-h-[18rem] min-w-0 flex-1`}><ModelViewer ref={viewerRef} project={project} userId={userId} simplified={mode === "simple"} hideManualDetailPins={showGuideSettings} previewCapture={previewCapture?{stepId:previewCapture.step.id,displayMode:previewCapture.displayMode}:null}/></div>
          {previewCapture?<div role="dialog" aria-modal="true" aria-label={t("editor.steps.manualCapture.title")} className={`absolute inset-x-3 top-3 z-40 mx-auto flex max-w-3xl flex-wrap items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-[var(--text)] shadow-xl transition duration-250 ease-out starting:scale-[.99] starting:opacity-0 motion-reduce:transition-none ${captureSession?.phase==="closing"?"pointer-events-none scale-[.99] opacity-0":"scale-100 opacity-100"}`}>
            <div className="min-w-48 flex-1"><p className="text-sm font-semibold">{t("editor.steps.manualCapture.title")}</p><p className="text-xs text-[var(--text-secondary)]">{t("editor.steps.manualCapture.cameraHelp")}</p></div>
            {previewCaptureUsesRegions?<label className="text-xs font-medium">{t("editor.steps.manualCapture.display")}<select value={previewCapture.displayMode} onChange={event=>setCaptureSession(current=>current?{...current,request:{...current.request,displayMode:event.target.value as ManualStepPreviewCaptureRequest["displayMode"]}}:current)} className="ml-2 h-9 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--card)] px-2"><option value="current-step">{t("editor.steps.manualCapture.current")}</option><option value="through-current-step">{t("editor.steps.manualCapture.through")}</option></select></label>:null}
            <button type="button" onClick={()=>viewerRef.current?.fitView()} className="h-9 cursor-pointer rounded-lg border border-[var(--border)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)]">{t("editor.steps.manualCapture.reset")}</button>
            <button type="button" onClick={closePreviewCapture} className="h-9 cursor-pointer rounded-lg border border-[var(--border)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)]">{t("common.cancel")}</button>
            <button type="button" onClick={captureManualPreview} className="h-9 cursor-pointer rounded-lg bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-foreground)] hover:brightness-110">{t("editor.steps.manualCapture.capture")}</button>
          </div>:null}
          {mode === "advanced"&&selectedReference&&effectiveReferenceViewMode!=="viewer"?<ReferenceSplitPanel reference={selectedReference} references={references} onSelect={setSelectedReferenceId} onClose={()=>setReferenceViewMode("viewer")}/>:null}
          {mode==="simple"&&simpleReferenceOpen&&selectedReference&&isDesktopReferenceLayout?<ReferenceSplitPanel reference={selectedReference} references={references} onSelect={selectReference} onClose={closeSimpleReference}/>:null}
          {mode === "advanced" ? <div className="absolute right-3 top-3 z-20 flex rounded-full border border-white/10 bg-black/70 p-1 text-xs">{(["viewer","split","reference"] as const).map(viewMode=><button key={viewMode} type="button" disabled={viewMode!=="viewer"&&references.length===0} onClick={()=>{if(viewMode==="viewer")setReferenceViewMode("viewer");else openReferenceMode(viewMode);}} className={`rounded-full px-3 py-1.5 disabled:opacity-40 ${effectiveReferenceViewMode===viewMode?"bg-orange-400 text-black":"text-neutral-300"}`}>{viewMode==="viewer"?t("viewer.model"):viewMode==="split"?t("viewer.split"):t("viewer.reference")}</button>)}</div> : null}
        </div>
        {mode === "simple" ? <GuideBuilderPanel captureHidden={Boolean(previewCapture)} projectId={project.id} activeReferenceId={selectedReference?.id??null} isReferenceVisible={simpleReferenceOpen&&Boolean(selectedReference)} onSelectReference={selectReference} onShowReference={showSimpleReference} onHideReference={closeSimpleReference} onReferenceDeleted={handleReferenceDeleted}/> : null}

        {mode === "advanced" ? <PropertiesPanel key="advanced-properties" /> : null}
      </div>

      {mode==="simple"&&simpleReferenceOpen&&selectedReference&&!isDesktopReferenceLayout?<SimpleReferenceViewer reference={selectedReference} references={references} onSelect={selectReference} onClose={closeSimpleReference}/>:null}

      <GuideCaptureOverlay
        onRetry={() => {
          if(lastGuideSettings)void generateGuidePreview(lastGuideSettings);
        }}
        onCancel={()=>{restoreManualDetailPinsRef.current?.();restoreManualDetailPinsRef.current=null;resetGuideGeneration();}}
      />
      {showGuideSettings?<GuideSettingsModal initial={lastGuideSettings??defaultSettings} canExplode={canExplode} canAssemble={canAssemble} onClose={()=>setShowGuideSettings(false)} onConfirm={settings=>{setShowGuideSettings(false);setLastGuideSettings(settings);void generateGuidePreview(settings);}}/>:null}
    </main>
    </ManualStepPreviewCaptureContext.Provider>
  </OnboardingProvider>;
}
