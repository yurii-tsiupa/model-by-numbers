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
  Suspense,
  useRef,
  useState,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { Project } from "@/features/models/types/Project";

import { useLocalModelUrl } from "../hooks/useLocalModelUrl";
import { LoadedModel } from "./LoadedModel";
import { ViewerError } from "./ViewerError";
import { ViewerErrorBoundary } from "./ViewerErrorBoundary";
import { ViewerLoading } from "./ViewerLoading";
import { ViewerToolbar } from "./ViewerToolbar";
import { useModelEditorStore } from "../store/modelEditorStore";

type ModelViewerProps = {
  project: Project;
  userId: string;
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
};

function Scene({
  modelUrl,
  controlsRef,
  isGridVisible,
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
        <LoadedModel modelUrl={modelUrl} />

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

export function ModelViewer({
  project,
  userId,
}: ModelViewerProps) {
  const controlsRef =
    useRef<OrbitControlsImpl | null>(null);

  const [isGridVisible, setIsGridVisible] =
    useState(true);

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

  const localModel = useLocalModelUrl({
    projectId: project.id,
    userId,
  });

  const {
    active: isAssetLoading,
    progress: loadingProgress,
  } = useProgress();

  function handleResetCamera() {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    controls.object.position.set(
      ...INITIAL_CAMERA_POSITION,
    );

    controls.target.set(...INITIAL_CAMERA_TARGET);

    controls.object.updateProjectionMatrix();
    controls.update();
  }

  function handleRetry() {
    setViewerError(null);
    setRetryKey((currentValue) => currentValue + 1);
  }

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
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            onPointerMissed={() => {
              selectPart(null);
            }}
          >
            <Scene
              modelUrl={localModel.modelUrl}
              controlsRef={controlsRef}
              isGridVisible={isGridVisible}
            />
          </Canvas>
        </ViewerErrorBoundary>
      ) : null}

      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
        <p className="truncate text-sm font-medium text-white">
          {project.name}
        </p>

        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {project.originalFileName || "Model file"}
        </p>
      </div>

      <ViewerToolbar
        isGridVisible={isGridVisible}
        hasParts={parts.length > 0}
        hasSelectedPart={Boolean(selectedPartId)}
        onResetCamera={handleResetCamera}
        onShowAll={showAllParts}
        onHideSelected={hideSelectedPart}
        onIsolateSelected={isolateSelectedPart}
        onToggleGrid={() =>
          setIsGridVisible((currentValue) => !currentValue)
        }
      />
    </section>
  );
}