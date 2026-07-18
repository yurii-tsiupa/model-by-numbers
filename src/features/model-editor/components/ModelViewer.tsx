"use client";

import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  useProgress,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  PerspectiveCamera,
  MathUtils,
  Box3,
  Sphere,
  Vector3,
  type Object3D,
} from "three";

import type { Project } from "@/features/models/types/Project";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import { useLocalModelUrl } from "../hooks/useLocalModelUrl";
import { LoadedModel } from "./LoadedModel";
import { ViewerError } from "./ViewerError";
import { ViewerErrorBoundary } from "./ViewerErrorBoundary";
import { ViewerLoading } from "./ViewerLoading";
import { ViewerToolbar } from "./ViewerToolbar";
import { useModelEditorStore } from "../store/modelEditorStore";
import { fitCameraToBounds } from "../lib/fitCameraToBounds";
import { getModelBounds } from "../lib/getModelBounds";
import {getVisibleModelBounds} from "../lib/getVisibleModelBounds";
import {getManualDetailFocusBounds} from "../lib/manualDetails/manualDetailFocus";
import { ViewerModeSwitcher } from "./ViewerModeSwitcher";
import type { ViewerMode } from "../types/ViewerMode";
import { waitForAnimationFrames } from "../lib/waitForAnimationFrames";
import {ExplodedViewToolbar} from "./ExplodedViewToolbar";
import type { ExplodedLabelsMode } from "../types/ExplodedLabelsMode";
import { captureAssemblyCanvas } from "../lib/captureAssemblyCanvas";
import { isEditableKeyboardTarget } from "../lib/isEditableKeyboardTarget";
import { createStepPreviewBlob } from "../step-previews/createStepPreviewBlob";
import type { StepPreviewFraming } from "../step-previews/types";

type ModelViewerProps = {
  project: Project;
  userId: string;
  simplified?: boolean;
};

export type ModelViewerHandle = {
  captureView: (mode: ViewerMode) => Promise<string>;
  fitView: () => void;
  captureAssemblyStep: (options: {partIds:string[];labelsMode:ExplodedLabelsMode}) => Promise<Blob>;
  generateStepPreview: (stepId:string) => Promise<{blob:Blob;framing:StepPreviewFraming}>;
};

const INITIAL_CAMERA_POSITION: [number, number, number] = [
  5.5, 4, 6.5,
];

const INITIAL_CAMERA_TARGET: [number, number, number] = [
  0, 1.5, 0,
];

type SceneProps = {
  modelUrl: string;
  modelFormat: Project["modelFormat"];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isGridVisible: boolean;
  onModelReady: (model: Object3D) => void;
  savedParts: Project["parts"];
  importSchemaVersion?: 1;
  baseColor: string;
  viewerMode: ViewerMode;
  showAllNumberCalloutsForCapture: boolean;
  showAllPartsForCapture: boolean;
  forceAssembled:boolean;
  forceFullyExploded:boolean;
  onControlsStart:()=>void;
};

function Scene({
  modelUrl,
  modelFormat,
  savedParts,
  importSchemaVersion,
  controlsRef,
  isGridVisible,
  onModelReady,
  baseColor,
  viewerMode,
  showAllNumberCalloutsForCapture,
  showAllPartsForCapture,
  forceAssembled,
  forceFullyExploded,
  onControlsStart,
}: SceneProps) {
  return (
    <>
      <color attach="background" args={["#151515"]} />

      <ambientLight intensity={0.8} />

      <directionalLight
        castShadow
        position={[5, 8, 5]}
        intensity={2.2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      <directionalLight
        position={[-4, 4, -3]}
        intensity={0.7}
        color="#fed7aa"
      />

      <Suspense fallback={null}>
        <LoadedModel
          modelUrl={modelUrl}
          modelFormat={modelFormat}
          savedParts={savedParts}
          importSchemaVersion={importSchemaVersion}
          viewerMode={viewerMode}
          baseColor={baseColor}
          onModelReady={onModelReady}
          showAllNumberCalloutsForCapture={
            showAllNumberCalloutsForCapture
          }
          showAllPartsForCapture={showAllPartsForCapture}
          forceAssembled={forceAssembled}
          forceFullyExploded={forceFullyExploded}
          controlsRef={controlsRef}
        />

        <Environment preset="studio" />

        <ContactShadows
          position={[0, -0.015, 0]}
          opacity={0.4}
          scale={12}
          blur={2.5}
          far={7}
        />
      </Suspense>

      {isGridVisible ? (
        <Grid
          position={[0, -0.02, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#3f3f46"
          sectionSize={2.5}
          sectionThickness={0.8}
          sectionColor="#52525b"
          fadeDistance={18}
          fadeStrength={1}
          infiniteGrid
        />
      ) : null}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={INITIAL_CAMERA_TARGET}
        enableRotate
        enableZoom
        enablePan
        enableDamping
        dampingFactor={0.07}
        minDistance={1.5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.01}
        onStart={onControlsStart}
      />
    </>
  );
}

export const ModelViewer = forwardRef<
  ModelViewerHandle,
  ModelViewerProps
>(function ModelViewer(
  { project, userId, simplified = false },
  ref,
) {
  const {t}=useTranslation();
  const manualDetailPlacement=useModelEditorStore(state=>state.manualDetailPlacement);
  const cancelManualDetailPlacement=useModelEditorStore(state=>state.cancelManualDetailPlacement);
  const undoDraftManualDetailPin=useModelEditorStore(state=>state.undoDraftManualDetailPin);
  const finishManualDetailPlacement=useModelEditorStore(state=>state.finishManualDetailPlacement);
  const manualDetailFocusRequest=useModelEditorStore(state=>state.manualDetailFocusRequest);
  const paintingTargetFocusRevision = useModelEditorStore((state) => state.paintingTargetFocusRevision);
  const isExplodedLayoutEditing = useModelEditorStore((state) => state.isExplodedLayoutEditing);
  const focusedAssemblyStepId = useModelEditorStore((state) => state.focusedAssemblyStepId);
  const focusedAssemblyStep = useModelEditorStore((state) => state.assemblySteps.find((step) => step.id === state.focusedAssemblyStepId));
  const exitAssemblyStepFocus = useModelEditorStore((state) => state.exitAssemblyStepFocus);
  const controlsRef =
    useRef<OrbitControlsImpl | null>(null);

  const modelRef = useRef<Object3D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isCaptureInProgressRef = useRef(false);
  const focusAnimationFrameRef=useRef<number|null>(null);
  const focusAnimationGenerationRef=useRef(0);

  const cancelFocusAnimation=useCallback(()=>{focusAnimationGenerationRef.current+=1;if(focusAnimationFrameRef.current!==null){cancelAnimationFrame(focusAnimationFrameRef.current);focusAnimationFrameRef.current=null}},[]);

  const focusManualDetail=useCallback((manualDetailId:string,pinId:string|null)=>{
    cancelFocusAnimation();
    const controls=controlsRef.current,model=modelRef.current;
    if(!controls||!model||!(controls.object instanceof PerspectiveCamera))return;
    const detail=useModelEditorStore.getState().manualDetails.find(item=>item.id===manualDetailId),modelBounds=getModelBounds(model);
    if(!detail)return;
    const frame=getManualDetailFocusBounds(detail,modelBounds,pinId);
    if(!frame){fitCameraToBounds({camera:controls.object,controls,bounds:modelBounds});return}
    const camera=controls.object,verticalHalfFov=Math.max(MathUtils.degToRad(camera.fov)/2,.01),aspect=Number.isFinite(camera.aspect)&&camera.aspect>0?camera.aspect:1,horizontalHalfFov=Math.atan(Math.tan(verticalHalfFov)*aspect),limitingHalfFov=Math.max(Math.min(verticalHalfFov,horizontalHalfFov),.01);
    let distance=frame.bounds.radius/Math.sin(limitingHalfFov);
    distance=MathUtils.clamp(distance,frame.bounds.radius*1.1,modelBounds.radius*4);
    const offset=frame.bounds.center.clone().sub(modelBounds.center),safeModelRadius=modelBounds.radius*1.08,b=offset.dot(frame.direction),c=offset.lengthSq()-safeModelRadius*safeModelRadius,discriminant=b*b-c;
    if(discriminant>=0)distance=Math.max(distance,-b+Math.sqrt(discriminant)+modelBounds.radius*.04);
    const destination=frame.bounds.center.clone().add(frame.direction.clone().multiplyScalar(distance)),startPosition=camera.position.clone(),startTarget=controls.target.clone(),generation=focusAnimationGenerationRef.current,startTime=performance.now(),duration=320;
    camera.near=Math.max(Math.min(distance-frame.bounds.radius,modelBounds.radius)/100,.01);camera.far=Math.max(distance+modelBounds.radius*4,modelBounds.radius*20,100);camera.updateProjectionMatrix();controls.enabled=true;
    const animate=(time:number)=>{if(generation!==focusAnimationGenerationRef.current)return;const progress=MathUtils.clamp((time-startTime)/duration,0,1),eased=1-Math.pow(1-progress,3);camera.position.lerpVectors(startPosition,destination,eased);const modelOffset=camera.position.clone().sub(modelBounds.center);if(modelOffset.length()<safeModelRadius)camera.position.copy(modelBounds.center).add((modelOffset.lengthSq()>1e-8?modelOffset.normalize():frame.direction).multiplyScalar(safeModelRadius));controls.target.lerpVectors(startTarget,frame.bounds.center,eased);controls.update();if(progress<1)focusAnimationFrameRef.current=requestAnimationFrame(animate);else focusAnimationFrameRef.current=null};
    focusAnimationFrameRef.current=requestAnimationFrame(animate);
  },[cancelFocusAnimation]);

  useEffect(() => {
    if (paintingTargetFocusRevision === 0) return;
    cancelFocusAnimation();
    const controls=controlsRef.current,model=modelRef.current,state=useModelEditorStore.getState();
    if(!controls||!model)return;
    const stage=state.parts.flatMap(part=>part.paintingWorkflow.stages).find(item=>item.id===state.activePaintingStageId);
    const references=stage?.targetReferences??[],bounds=new Box3(),partIds=new Set(references.filter(reference=>reference.type==="part").map(reference=>reference.id)),meshIds=new Set(state.parts.filter(part=>partIds.has(part.id)).map(part=>part.meshUuid));
    model.traverse(object=>{if(meshIds.has(object.uuid))bounds.expandByObject(object)});
    for(const reference of references){if(reference.type==="part")continue;const detail=state.manualDetails.find(item=>item.id===reference.id);for(const pin of detail?.pins??[])bounds.expandByPoint(new Vector3(pin.position.x,pin.position.y,pin.position.z));}
    const targetBounds = bounds.isEmpty() ? getModelBounds(model) : { box: bounds, center: bounds.getCenter(new Vector3()), size: bounds.getSize(new Vector3()), sphere: bounds.getBoundingSphere(new Sphere()), radius: bounds.getBoundingSphere(new Sphere()).radius };
    fitCameraToBounds({camera:controls.object as PerspectiveCamera,controls,bounds:targetBounds});
  },[cancelFocusAnimation,paintingTargetFocusRevision]);

  useEffect(()=>{if(manualDetailFocusRequest)focusManualDetail(manualDetailFocusRequest.detailId,manualDetailFocusRequest.pinId)},[focusManualDetail,manualDetailFocusRequest]);

  useEffect(() => () => {
    cancelFocusAnimation();
    isCaptureInProgressRef.current = false;
    if (controlsRef.current) controlsRef.current.enabled = true;
    controlsRef.current = null;
    modelRef.current = null;
    canvasRef.current = null;
    const state = useModelEditorStore.getState();
    if (state.focusedAssemblyStepId) state.exitAssemblyStepFocus();
    state.stopExplodedLayoutEditing();
    state.resetExplodedViewerState();
  }, [cancelFocusAnimation]);

  const [isGridVisible, setIsGridVisible] =
    useState(true);

  const [
    showAllNumberCalloutsForCapture,
    setShowAllNumberCalloutsForCapture,
  ] = useState(false);

  const [showAllPartsForCapture, setShowAllPartsForCapture] =
    useState(false);
  const [forceAssembled,setForceAssembled]=useState(false);
  const [forceFullyExploded,setForceFullyExploded]=useState(false);

  const [viewerError, setViewerError] =
    useState<Error | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const selectedPartId = useModelEditorStore(
    (state) => state.selectedPartId,
  );

  const selectPart = useModelEditorStore(
    (state) => state.selectPart,
  );

  const showAllParts = useModelEditorStore(
    (state) => state.showAllParts,
  );

  const hideSelectedPart = useModelEditorStore(
    (state) => state.hideSelectedPart,
  );

  const isolateSelectedPart = useModelEditorStore(
    (state) => state.isolateSelectedPart,
  );

  const viewerMode = useModelEditorStore(
    (state) => state.viewerMode,
  );

  const selectedPartIds = useModelEditorStore(
    (state) => state.selectedPartIds,
  );

  const highlightedPaletteColorId =
    useModelEditorStore(
      (state) =>
        state.highlightedPaletteColorId,
    );

  const setViewerMode = useModelEditorStore(
    (state) => state.setViewerMode,
  );
  const setExplodedLabelsMode = useModelEditorStore((state) => state.setExplodedLabelsMode);


  const setSelectedPartIds = useModelEditorStore(
    (state) => state.setSelectedPartIds,
  );

  const setHighlightedPaletteColorId =
    useModelEditorStore(
      (state) => state.setHighlightedPaletteColorId,
    );

  const localModel = useLocalModelUrl({
    projectId: project.id,
    userId,
  });

  const {
    active: isAssetLoading,
    progress: loadingProgress,
  } = useProgress();

  const fitFullModel = useCallback(() => {
    cancelFocusAnimation();
    const model = modelRef.current;
    const controls = controlsRef.current;

    if (!model) {
      throw new Error("Model is not ready for capture.");
    }

    if (!controls) {
      throw new Error(
        "Camera controls are unavailable for capture.",
      );
    }

    const camera = controls.object;

    if (!(camera instanceof PerspectiveCamera)) {
      throw new Error(
        "A perspective camera is required for capture.",
      );
    }

    model.updateWorldMatrix(true, true);
    const bounds = getVisibleModelBounds(model);

    fitCameraToBounds({
      camera,
      controls,
      bounds,
    });
  }, [cancelFocusAnimation]);

  const handleModelReady = useCallback(
    (model: Object3D) => {
      modelRef.current = model;

      try {
        fitFullModel();
      } catch {
        requestAnimationFrame(() => {
          try {
            fitFullModel();
          } catch {
            // The viewer remains available while controls initialize.
          }
        });
      }
    },
    [fitFullModel],
  );

  const handleFitModel = useCallback(() => {
    try {
      fitFullModel();
    } catch {
      // Toolbar fitting is unavailable until the model is ready.
    }
  }, [fitFullModel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isEditableKeyboardTarget(event.target)) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const state = useModelEditorStore.getState();
      if (event.key === "Escape") {
        if (state.isExplodedLayoutEditing) state.stopExplodedLayoutEditing();
        else if (state.focusedAssemblyStepId) state.exitAssemblyStepFocus();
        return;
      }
      if (event.repeat) return;
      if (event.key.toLowerCase() === "e" && state.parts.length > 1) setViewerMode(state.viewerMode === "exploded" ? "painted" : "exploded");
      else if (event.key.toLowerCase() === "l" && state.viewerMode === "exploded") {
        const modes: readonly ExplodedLabelsMode[] = ["none", "numbers", "numbers-and-names"];
        setExplodedLabelsMode(modes[(modes.indexOf(state.explodedLabelsMode) + 1) % modes.length]);
      } else if (event.key.toLowerCase() === "f") handleFitModel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFitModel, setExplodedLabelsMode, setViewerMode]);

  function handleResetCamera() {
    cancelFocusAnimation();
    const model = modelRef.current;
    const controls = controlsRef.current;

    if (!model || !controls) {
      return;
    }

    const camera = controls.object;

    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }

    const bounds = getVisibleModelBounds(model);

    fitCameraToBounds({
      camera,
      controls,
      bounds,
      direction: new Vector3(
        ...INITIAL_CAMERA_POSITION,
      ).normalize(),
    });
  }

  function handleRetry() {
    setViewerError(null);
    setRetryKey((currentValue) => currentValue + 1);
  }

  useImperativeHandle (
    ref,
    () => ({
      fitView: handleFitModel,
      generateStepPreview:async(stepId)=>{const model=modelRef.current;if(!model)throw new Error("modelUnavailable");const state=useModelEditorStore.getState(),step=state.parts.flatMap(part=>part.paintingWorkflow.stages).find(item=>item.id===stepId);if(!step)throw new Error("targetsUnavailable");model.updateWorldMatrix(true,true);return createStepPreviewBlob({model,step,parts:state.parts,manualDetails:state.manualDetails,palette:state.palette})},
      captureAssemblyStep: async ({partIds,labelsMode}) => {
        cancelFocusAnimation();
        if(isCaptureInProgressRef.current)throw new Error("Capture busy.");
        const model=modelRef.current,canvas=canvasRef.current,controls=controlsRef.current;
        if(!model||!canvas||!controls||localModel.isLoading||isAssetLoading)throw new Error("Viewer unavailable.");
        const camera=controls.object;if(!(camera instanceof PerspectiveCamera))throw new Error("Camera unavailable.");
        const editor=useModelEditorStore.getState();const validIds=new Set(partIds.filter(id=>editor.parts.some(part=>part.id===id)));
        if(validIds.size===0)throw new Error("No valid parts.");
        const saved={viewerMode:editor.viewerMode,explosionFactor:editor.explosionFactor,explodedLabelsMode:editor.explodedLabelsMode,isExplodedLayoutEditing:editor.isExplodedLayoutEditing,parts:editor.parts,selectedPartId:editor.selectedPartId,selectedPartIds:editor.selectedPartIds,highlightedPaletteColorId:editor.highlightedPaletteColorId,grid:isGridVisible,cameraPosition:camera.position.clone(),cameraQuaternion:camera.quaternion.clone(),cameraUp:camera.up.clone(),near:camera.near,far:camera.far,zoom:camera.zoom,target:controls.target.clone(),controlsEnabled:controls.enabled};
        isCaptureInProgressRef.current=true;
        try{
          controls.enabled=false;setIsGridVisible(false);setForceFullyExploded(true);
          useModelEditorStore.setState({viewerMode:"exploded",explosionFactor:1,explodedLabelsMode:labelsMode,isExplodedLayoutEditing:false,parts:editor.parts.map(part=>({...part,visible:validIds.has(part.id)})),selectedPartId:null,selectedPartIds:[],highlightedPaletteColorId:null});
          await waitForAnimationFrames(4);model.updateWorldMatrix(true,true);fitCameraToBounds({camera,controls,bounds:getVisibleModelBounds(model)});await waitForAnimationFrames(4);
          return await captureAssemblyCanvas(canvas);
        }finally{
          setForceFullyExploded(false);setIsGridVisible(saved.grid);
          useModelEditorStore.setState({viewerMode:saved.viewerMode,explosionFactor:saved.explosionFactor,explodedLabelsMode:saved.explodedLabelsMode,isExplodedLayoutEditing:saved.isExplodedLayoutEditing,parts:saved.parts,selectedPartId:saved.selectedPartId,selectedPartIds:saved.selectedPartIds,highlightedPaletteColorId:saved.highlightedPaletteColorId});
          camera.position.copy(saved.cameraPosition);camera.quaternion.copy(saved.cameraQuaternion);camera.up.copy(saved.cameraUp);camera.near=saved.near;camera.far=saved.far;camera.zoom=saved.zoom;camera.updateProjectionMatrix();controls.target.copy(saved.target);controls.enabled=saved.controlsEnabled;controls.update();await waitForAnimationFrames(2);isCaptureInProgressRef.current=false;
        }
      },
      captureView: async (mode) => {
        cancelFocusAnimation();
        if (isCaptureInProgressRef.current) {
          throw new Error(
            "A model capture is already in progress.",
          );
        }

        const model = modelRef.current;
        const canvas = canvasRef.current;
        const controls = controlsRef.current;

        if (!model || localModel.isLoading || isAssetLoading) {
          throw new Error("Model is not ready for capture.");
        }

        if (!canvas) {
          throw new Error(
            "The model canvas is unavailable for capture.",
          );
        }

        if (!controls) {
          throw new Error(
            "Camera controls are unavailable for capture.",
          );
        }

        const camera = controls.object;

        if (!(camera instanceof PerspectiveCamera)) {
          throw new Error(
            "A perspective camera is required for capture.",
          );
        }

        const editorState = useModelEditorStore.getState();
        const savedEditorState = {
          viewerMode: editorState.viewerMode,
          selectedPartId: editorState.selectedPartId,
          selectedPartIds: [...editorState.selectedPartIds],
          highlightedPaletteColorId:
            editorState.highlightedPaletteColorId,
          isExplodedLayoutEditing: editorState.isExplodedLayoutEditing,
        };
        const savedCameraState = {
          position: camera.position.clone(),
          quaternion: camera.quaternion.clone(),
          up: camera.up.clone(),
          near: camera.near,
          far: camera.far,
          zoom: camera.zoom,
          target: controls.target.clone(),
          controlsEnabled: controls.enabled,
        };
        const savedGridVisibility = isGridVisible;
        isCaptureInProgressRef.current = true;

        try {
          controls.enabled = false;
          setViewerMode(mode);
          selectPart(null);
          setSelectedPartIds([]);
          setHighlightedPaletteColorId(null);
          setShowAllPartsForCapture(true);
          setForceAssembled(true);
          setIsGridVisible(false);
          setShowAllNumberCalloutsForCapture(mode === "numbers");

          await waitForAnimationFrames(3);
          model.updateWorldMatrix(true, true);
          fitCameraToBounds({ camera, controls, bounds: getModelBounds(model), direction: new Vector3(...INITIAL_CAMERA_POSITION).normalize() });
          await waitForAnimationFrames(3);

          const image = canvas.toDataURL("image/png");

          if (
            !image.startsWith("data:image/png;base64,") ||
            image.length <= "data:image/png;base64,".length
          ) {
            throw new Error(
              "The model canvas returned an invalid PNG capture.",
            );
          }

          return image;
        } finally {
          setViewerMode(savedEditorState.viewerMode);
          if (
            savedEditorState.viewerMode === "exploded" &&
            savedEditorState.isExplodedLayoutEditing
          ) {
            useModelEditorStore.getState().startExplodedLayoutEditing();
          }
          selectPart(savedEditorState.selectedPartId);
          setSelectedPartIds(savedEditorState.selectedPartIds);
          setHighlightedPaletteColorId(
            savedEditorState.highlightedPaletteColorId,
          );
          setShowAllPartsForCapture(false);
          setForceAssembled(false);
          setIsGridVisible(savedGridVisibility);
          setShowAllNumberCalloutsForCapture(false);

          camera.position.copy(savedCameraState.position);
          camera.quaternion.copy(savedCameraState.quaternion);
          camera.up.copy(savedCameraState.up);
          camera.near = savedCameraState.near;
          camera.far = savedCameraState.far;
          camera.zoom = savedCameraState.zoom;
          camera.updateProjectionMatrix();
          controls.target.copy(savedCameraState.target);
          controls.enabled = savedCameraState.controlsEnabled;
          controls.update();

          await waitForAnimationFrames(2);
          isCaptureInProgressRef.current = false;
        }
      },
    }),
    [
      handleFitModel,
      cancelFocusAnimation,
      isAssetLoading,
      isGridVisible,
      localModel.isLoading,
      selectPart,
      setHighlightedPaletteColorId,
      setSelectedPartIds,
      setViewerMode,
    ],
  );

  const shouldShowNumbersHint =
    viewerMode === "numbers" &&
    !selectedPartId &&
    selectedPartIds.length === 0 &&
    !highlightedPaletteColorId;

  const currentError =
    localModel.error ?? viewerError;

  const isLoading =
    localModel.isLoading ||
    (Boolean(localModel.modelUrl) && isAssetLoading);

  if (currentError) {
    return (
      <section className="relative min-h-[34rem] min-w-0 flex-1 overflow-hidden bg-neutral-900">
        <ViewerError
          message={currentError.message}
          onRetry={handleRetry}
        />
      </section>
    );
  }

  return (
    <section className={`relative min-h-[34rem] min-w-0 flex-1 overflow-hidden bg-neutral-900 ${manualDetailPlacement?"cursor-crosshair":""}`}>
      {isLoading ? (
        <div className="absolute inset-0 z-20 bg-neutral-900">
          <ViewerLoading />

          {isAssetLoading ? (
            <p className="absolute inset-x-0 top-[58%] text-center text-xs text-neutral-600">
              {Math.round(loadingProgress)}%
            </p>
          ) : null}
        </div>
      ) : null}

      {localModel.modelUrl ? (
        <ViewerErrorBoundary
          key={retryKey}
          resetKey={`${localModel.modelUrl}-${retryKey}`}
          onError={setViewerError}
        >
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{
              position: INITIAL_CAMERA_POSITION,
              fov: 42,
              near: 0.1,
              far: 100,
            }}
            gl={{
              preserveDrawingBuffer: true,
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => {
              canvasRef.current = gl.domElement;
            }}
            onPointerMissed={() => {
              selectPart(null);
            }}
          >
          <Scene
              modelUrl={localModel.modelUrl}
              modelFormat={project.modelFormat}
              savedParts={project.parts}
              importSchemaVersion={project.importSchemaVersion}
              viewerMode={viewerMode}
              baseColor={project.baseColor}
              controlsRef={controlsRef}
              isGridVisible={isGridVisible}
              onModelReady={handleModelReady}
              showAllNumberCalloutsForCapture={
                showAllNumberCalloutsForCapture
              }
              showAllPartsForCapture={showAllPartsForCapture}
              forceAssembled={forceAssembled}
            forceFullyExploded={forceFullyExploded}
            onControlsStart={cancelFocusAnimation}
            />
          </Canvas>
        </ViewerErrorBoundary>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
      {!simplified ? <ViewerModeSwitcher /> : null}
      </div>
      {manualDetailPlacement?<div role="status" className="absolute left-1/2 top-4 z-30 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-xl border border-[var(--accent)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--text)]"><span>{t("editor.manualDetails.placement.help")}</span><span>{t("editor.manualDetails.pinCount",{count:manualDetailPlacement.pins.length})}</span><button type="button" disabled={!manualDetailPlacement.pins.length} onClick={undoDraftManualDetailPin} className="rounded-lg border border-[var(--border)] px-2 py-1 disabled:opacity-40">{t("editor.manualDetails.undo")}</button><button type="button" disabled={!manualDetailPlacement.pins.length} onClick={finishManualDetailPlacement} className="rounded-lg bg-[var(--accent)] px-2 py-1 text-[var(--accent-foreground)] disabled:opacity-40">{t("editor.manualDetails.finish")}</button><button type="button" onClick={cancelManualDetailPlacement} className="rounded-lg border border-[var(--border)] px-2 py-1">{t("common.cancel")}</button></div>:null}
      {focusedAssemblyStep ? <div role="status" className="absolute left-1/2 top-20 z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-orange-400/30 bg-black/80 px-4 py-2 shadow-xl backdrop-blur"><div><p className="text-xs font-semibold text-orange-200">{t("assembly.focus.bannerTitle",{number:String(focusedAssemblyStep.order).padStart(2,"0")})}</p><p className="text-[10px] text-neutral-400">{t("assembly.focus.bannerDescription")}</p></div><button type="button" onClick={exitAssemblyStepFocus} className="rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-semibold text-black">{t("assembly.focus.exit")}</button></div>:null}

      {shouldShowNumbersHint ? (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-4">
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-neutral-400 shadow-xl backdrop-blur-xl">
            {t("viewer.numbersHint")}
          </div>
        </div>
      ) : null}

      {!simplified&&viewerMode==="exploded"&&parts.length>1?<div className="absolute left-0 top-20 z-10"><ExplodedViewToolbar onFit={handleFitModel}/></div>:null}

      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
        <p className="truncate text-sm font-medium text-white">
          {project.name}
        </p>

        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {project.originalFileName || t("models.modelFile")}
        </p>
      </div>

      <ViewerToolbar
        simplified={simplified}
        isGridVisible={isGridVisible}
        hasParts={parts.length > 0}
        hasSelectedPart={Boolean(selectedPartId)}
        partActionsDisabled={isExplodedLayoutEditing || Boolean(focusedAssemblyStepId)}
        onResetCamera={handleResetCamera}
        onFitModel={handleFitModel}
        onShowAll={() => { if (focusedAssemblyStepId) exitAssemblyStepFocus(); showAllParts(); }}
        onHideSelected={hideSelectedPart}
        onIsolateSelected={isolateSelectedPart}
        onToggleGrid={() =>
          setIsGridVisible((currentValue) => !currentValue)
        }
      />
    </section>
  );
});
