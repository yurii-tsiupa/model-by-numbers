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
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  PerspectiveCamera,
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
import { ViewerModeSwitcher } from "./ViewerModeSwitcher";
import type { ViewerMode } from "../types/ViewerMode";
import { waitForAnimationFrames } from "../lib/waitForAnimationFrames";
import {ExplodedViewToolbar} from "./ExplodedViewToolbar";

type ModelViewerProps = {
  project: Project;
  userId: string;
};

export type ModelViewerHandle = {
  captureView: (mode: ViewerMode) => Promise<string>;
  fitView: () => void;
};

const INITIAL_CAMERA_POSITION: [number, number, number] = [
  5.5, 4, 6.5,
];

const INITIAL_CAMERA_TARGET: [number, number, number] = [
  0, 1.5, 0,
];

type SceneProps = {
  modelUrl: string;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isGridVisible: boolean;
  onModelReady: (model: Object3D) => void;
  savedParts: Project["parts"];
  baseColor: string;
  viewerMode: ViewerMode;
  showAllNumberCalloutsForCapture: boolean;
  showAllPartsForCapture: boolean;
  forceAssembled:boolean;
};

function Scene({
  modelUrl,
  savedParts,
  controlsRef,
  isGridVisible,
  onModelReady,
  baseColor,
  viewerMode,
  showAllNumberCalloutsForCapture,
  showAllPartsForCapture,
  forceAssembled,
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
          savedParts={savedParts}
          viewerMode={viewerMode}
          baseColor={baseColor}
          onModelReady={onModelReady}
          showAllNumberCalloutsForCapture={
            showAllNumberCalloutsForCapture
          }
          showAllPartsForCapture={showAllPartsForCapture}
          forceAssembled={forceAssembled}
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
      />
    </>
  );
}

export const ModelViewer = forwardRef<
  ModelViewerHandle,
  ModelViewerProps
>(function ModelViewer(
  { project, userId },
  ref,
) {
  const {t}=useTranslation();
  const isExplodedLayoutEditing = useModelEditorStore((state) => state.isExplodedLayoutEditing);
  const controlsRef =
    useRef<OrbitControlsImpl | null>(null);

  const modelRef = useRef<Object3D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isCaptureInProgressRef = useRef(false);

  const [isGridVisible, setIsGridVisible] =
    useState(true);

  const [
    showAllNumberCalloutsForCapture,
    setShowAllNumberCalloutsForCapture,
  ] = useState(false);

  const [showAllPartsForCapture, setShowAllPartsForCapture] =
    useState(false);
  const [forceAssembled,setForceAssembled]=useState(false);

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
  }, []);

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

  function handleResetCamera() {
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
      captureView: async (mode) => {
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
    <section className="relative min-h-[34rem] min-w-0 flex-1 overflow-hidden bg-neutral-900">
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
              savedParts={project.parts}
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
            />
          </Canvas>
        </ViewerErrorBoundary>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
        <ViewerModeSwitcher />
      </div>

      {shouldShowNumbersHint ? (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-4">
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-neutral-400 shadow-xl backdrop-blur-xl">
            {t("viewer.numbersHint")}
          </div>
        </div>
      ) : null}

      {viewerMode==="exploded"&&parts.length>1?<div className="absolute left-0 top-20 z-10"><ExplodedViewToolbar onFit={handleFitModel}/></div>:null}

      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
        <p className="truncate text-sm font-medium text-white">
          {project.name}
        </p>

        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {project.originalFileName || t("models.modelFile")}
        </p>
      </div>

      <ViewerToolbar
        isGridVisible={isGridVisible}
        hasParts={parts.length > 0}
        hasSelectedPart={Boolean(selectedPartId)}
        partActionsDisabled={isExplodedLayoutEditing}
        onResetCamera={handleResetCamera}
        onFitModel={handleFitModel}
        onShowAll={showAllParts}
        onHideSelected={hideSelectedPart}
        onIsolateSelected={isolateSelectedPart}
        onToggleGrid={() =>
          setIsGridVisible((currentValue) => !currentValue)
        }
      />
    </section>
  );
});
