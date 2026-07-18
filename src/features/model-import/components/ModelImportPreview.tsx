"use client";

import { Bounds, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  BoxHelper,
  Color,
  Group,
  Mesh,
  PerspectiveCamera,
  Vector3,
  type Object3D,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { fitCameraToBounds } from "@/features/model-editor/lib/fitCameraToBounds";
import { getModelBounds } from "@/features/model-editor/lib/getModelBounds";

import { useImportTransformPreview } from "../context/ImportTransformPreviewContext";
import type { ImportTransform } from "../types/ImportTransform";

const CAMERA_DIRECTION = new Vector3(5.5, 4, 6.5).normalize();

type PreviewSceneProps = {
  source: Object3D;
  selectedUuid: string | null;
  isolate: boolean;
  transform: ImportTransform;
  groupRef: RefObject<Group | null>;
};

function PreviewScene({
  source,
  selectedUuid,
  isolate,
  transform,
  groupRef,
}: PreviewSceneProps) {
  const [accentColor] = useState(() => {
    if (typeof document === "undefined") return "#ffffff";
    const rootStyles = getComputedStyle(document.documentElement);
    return rootStyles.getPropertyValue("--accent").trim() || rootStyles.getPropertyValue("--text").trim() || "#ffffff";
  });

  useEffect(() => {
    const visibility = new Map<string, boolean>();

    source.traverse((object) => {
      visibility.set(object.uuid, object.visible);

      object.visible =
        !isolate ||
        object.uuid === selectedUuid ||
        object.children.some(
          (child) => child.uuid === selectedUuid,
        );
    });

    return () => {
      source.traverse((object) => {
        object.visible =
          visibility.get(object.uuid) ?? object.visible;
      });
    };
  }, [isolate, selectedUuid, source]);

  const selected = useMemo(() => {
    let found: Object3D | null = null;

    source.traverse((object) => {
      if (object.uuid === selectedUuid) {
        found = object;
      }
    });

    return found;
  }, [selectedUuid, source]);

  const helper = useMemo(() => {
    if (!selected) {
      return null;
    }

    return new BoxHelper(
      selected,
      new Color(accentColor),
    );
  }, [accentColor, selected]);

  useEffect(() => {
    return () => {
      helper?.dispose();
    };
  }, [helper]);

  return (
    <Bounds fit clip observe margin={1.25}>
      <group
        ref={groupRef}
        rotation={transform.rotation}
        scale={transform.scale}
        position={transform.centerOffset}
      >
        <primitive object={source} />

        {helper ? <primitive object={helper} /> : null}
      </group>
    </Bounds>
  );
}

type ModelImportPreviewProps = {
  scene: Object3D;
  selectedUuid: string | null;
  isolate: boolean;
};

export function ModelImportPreview({
  scene,
  selectedUuid,
  isolate,
}: ModelImportPreviewProps) {
  const {
    transform,
    includedMeshUuids,
    captureRef,
  } = useImportTransformPreview();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef =
    useRef<OrbitControlsImpl | null>(null);
  const groupRef = useRef<Group | null>(null);

  const capture = useCallback(async () => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const group = groupRef.current;

    if (!canvas || !camera || !controls || !group) {
      throw new Error("Import preview unavailable.");
    }

    const visibility = new Map<Object3D, boolean>();

    group.traverse((object) => {
      visibility.set(object, object.visible);

      if (object instanceof Mesh) {
        object.visible = includedMeshUuids.has(
          object.uuid,
        );
      }

      if (object instanceof BoxHelper) {
        object.visible = false;
      }
    });

    const position = camera.position.clone();
    const quaternion = camera.quaternion.clone();
    const target = controls.target.clone();

    try {
      group.updateWorldMatrix(true, true);

      fitCameraToBounds({
        camera,
        controls,
        bounds: getModelBounds(group),
        direction: CAMERA_DIRECTION,
      });

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      return canvas.toDataURL("image/png");
    } finally {
      visibility.forEach((value, object) => {
        object.visible = value;
      });

      camera.position.copy(position);
      camera.quaternion.copy(quaternion);
      controls.target.copy(target);
      controls.update();
    }
  }, [includedMeshUuids]);

  useEffect(() => {
    captureRef.current = capture;

    return () => {
      if (captureRef.current === capture) {
        captureRef.current = null;
      }
    };
  }, [capture, captureRef]);

  return (
    <div className="relative h-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_5%,transparent),transparent_65%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-[var(--border)]"
      />

      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [5, 4, 6],
          fov: 42,
        }}
        onCreated={({ gl, camera }) => {
          canvasRef.current = gl.domElement;

          gl.setClearColor(0x000000, 0);

          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
        }}
      >
        <ambientLight intensity={1.4} />

        <directionalLight
          position={[5, 8, 5]}
          intensity={2}
        />

        <directionalLight
          position={[-4, 2, -3]}
          intensity={0.7}
        />

        <PreviewScene
          source={scene}
          selectedUuid={selectedUuid}
          isolate={isolate}
          transform={transform}
          groupRef={groupRef}
        />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-end gap-1"
      >
        <span className="h-1 w-5 rounded-full bg-[var(--accent)]" />
        <span className="h-1 w-3 rounded-full bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]" />
        <span className="h-1 w-2 rounded-full bg-[color-mix(in_srgb,var(--accent)_25%,transparent)]" />
      </div>
    </div>
  );
}
