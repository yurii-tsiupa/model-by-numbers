"use client";

import {Html,TransformControls,useGLTF} from "@react-three/drei";
import {useFrame,type ThreeEvent} from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Mesh,
  MathUtils,
  Vector3,
  type Object3D,
} from "three";
import type { GLTF } from "three-stdlib";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { extractModelParts } from "../lib/extractModelParts";
import { normalizeModel } from "../lib/normalizeModel";
import {
  disposeModelMaterials,
  prepareModelMeshes,
} from "../lib/prepareModelMeshes";
import { syncModelParts } from "../lib/syncModelParts";
import { useModelEditorStore } from "../store/modelEditorStore";
import type { ProjectPart } from "@/features/models/types/ProjectPart";
import { mergeModelParts } from "../lib/mergeModelParts";
import type { ViewerMode } from "../types/ViewerMode";
import { ModelNumberLabels } from "./ModelNumberLabels";
import {buildExplodedLayout} from "../lib/exploded/buildExplodedLayout";
import {EXPLOSION_DAMPING} from "../lib/exploded/exploded.constants";
import {ExplodedPartLabels} from "./ExplodedPartLabels";
import {useTranslation} from "@/features/i18n/hooks/useTranslation";
import {MAX_EXPLODED_OFFSET} from "../lib/exploded/exploded.constants";

type LoadedModelProps = {
  modelUrl: string;
  savedParts: ProjectPart[];
  viewerMode: ViewerMode;
  baseColor: string;
  showAllNumberCalloutsForCapture: boolean;
  showAllPartsForCapture: boolean;
  forceAssembled:boolean;
  forceFullyExploded: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onModelReady?: (
    model: Object3D,
  ) => void;
};

export function LoadedModel({
  modelUrl,
  savedParts,
  viewerMode,
  baseColor,
  showAllNumberCalloutsForCapture,
  showAllPartsForCapture,
  forceAssembled,
  forceFullyExploded,
  controlsRef,
  onModelReady,
}: LoadedModelProps) {
  const {t}=useTranslation();
  const gltf = useGLTF(modelUrl) as GLTF;

  const hasInitializedPartsRef = useRef(false);
  const isTransformDraggingRef = useRef(false);
  const [transformError, setTransformError] = useState(false);

  const parts = useModelEditorStore(
    (state) => state.parts,
  );

  const selectedPartId = useModelEditorStore(
    (state) => state.selectedPartId,
  );

  const setParts = useModelEditorStore(
    (state) => state.setParts,
  );

  const selectPart = useModelEditorStore(
    (state) => state.selectPart,
  );

  const selectionMode =
    useModelEditorStore(
      (state) => state.selectionMode,
    );

  const toggleSelectedPart =
    useModelEditorStore(
      (state) => state.toggleSelectedPart,
    );

  const palette = useModelEditorStore(
    (state) => state.palette,
  );

  const highlightedPaletteColorId =
    useModelEditorStore(
      (state) =>
        state.highlightedPaletteColorId,
    );

  const selectedPartIds =
    useModelEditorStore(
      (state) => state.selectedPartIds,
    );
  const explosionFactor=useModelEditorStore(state=>state.explosionFactor);
  const explodedLabelsMode=useModelEditorStore(state=>state.explodedLabelsMode);
  const isExplodedLayoutEditing=useModelEditorStore(state=>state.isExplodedLayoutEditing);
  const setPartExplodedOffset=useModelEditorStore(state=>state.setPartExplodedOffset);
  const stopExplodedLayoutEditing=useModelEditorStore(state=>state.stopExplodedLayoutEditing);

  const model = useMemo(() => {
    const normalizedModel = normalizeModel(
      gltf.scene,
    );

    prepareModelMeshes(normalizedModel);

    return normalizedModel;
  }, [gltf.scene]);

  const presentationParts = useMemo(
    () =>
      showAllPartsForCapture
        ? parts.map((part) => ({
            ...part,
            visible: part.includeInGuide,
          }))
        : parts,
    [parts, showAllPartsForCapture],
  );
  const partStructure=parts.map(part=>`${part.id}:${part.meshUuid}`).join("|");
  const explodedLayout=useMemo(() => {
    if (parts.length <= 1) {
      return [];
    }

    try {
      return buildExplodedLayout(model, parts);
    } catch (error) {
      console.warn("Unable to build exploded model layout", error);
      return [];
    }
    // Only identity/mapping changes rebuild the immutable runtime layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, partStructure]);
  const explodedTargets = useMemo(() => {
    const partsById = new Map(parts.map((part) => [part.id, part]));
    return new Map(explodedLayout.map((runtime) => {
      const offset = partsById.get(runtime.partId)?.explodedOffset;
      const position: [number, number, number] = offset
        ? [
            runtime.originalTransform.position[0] + offset.x,
            runtime.originalTransform.position[1] + offset.y,
            runtime.originalTransform.position[2] + offset.z,
          ]
        : [...runtime.automaticExplodedTransform.position];
      return [runtime.partId, position] as const;
    }));
  }, [explodedLayout, parts]);
  useEffect(()=>()=>{for(const runtime of explodedLayout){runtime.mesh.position.set(...runtime.originalTransform.position);runtime.mesh.rotation.set(...runtime.originalTransform.rotation);runtime.mesh.scale.set(...runtime.originalTransform.scale);}},[explodedLayout]);
  useFrame((_,delta)=>{const factor=viewerMode==="exploded"&&!forceAssembled?explosionFactor:0;for(const runtime of explodedLayout){if(isTransformDraggingRef.current&&runtime.partId===selectedPartId)continue;const explodedTarget=explodedTargets.get(runtime.partId)??runtime.explodedTransform.position;const target=runtime.originalTransform.position.map((value,index)=>MathUtils.lerp(value,explodedTarget[index],factor)) as [number,number,number];if(forceAssembled){runtime.mesh.position.set(...runtime.originalTransform.position);}else if(forceFullyExploded){runtime.mesh.position.set(...explodedTarget);}else{runtime.mesh.position.set(MathUtils.damp(runtime.mesh.position.x,target[0],EXPLOSION_DAMPING,delta),MathUtils.damp(runtime.mesh.position.y,target[1],EXPLOSION_DAMPING,delta),MathUtils.damp(runtime.mesh.position.z,target[2],EXPLOSION_DAMPING,delta));}runtime.mesh.rotation.set(...runtime.originalTransform.rotation);runtime.mesh.scale.set(...runtime.originalTransform.scale);}});

  useEffect(() => {
    if (!isExplodedLayoutEditing) return;
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches("input, textarea, select") || target.isContentEditable)) return;
      if (event.key === "Escape") stopExplodedLayoutEditing();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExplodedLayoutEditing, stopExplodedLayoutEditing]);
  useEffect(() => {
    if (isExplodedLayoutEditing || forceFullyExploded) return;
    isTransformDraggingRef.current = false;
    if (controlsRef.current) controlsRef.current.enabled = true;
  }, [controlsRef, forceFullyExploded, isExplodedLayoutEditing]);

  const editingRuntime = explodedLayout.find((runtime) => runtime.partId === selectedPartId);
  const editingPart = parts.find((part) => part.id === selectedPartId);
  function handleTransformStart() {
    setTransformError(false);
    isTransformDraggingRef.current = true;
    if (editingRuntime) {
      editingRuntime.mesh.position.set(...(explodedTargets.get(editingRuntime.partId) ?? editingRuntime.explodedTransform.position));
    }
    if (controlsRef.current) controlsRef.current.enabled = false;
  }
  function handleTransformEnd() {
    const runtime = editingRuntime;
    isTransformDraggingRef.current = false;
    if (controlsRef.current) controlsRef.current.enabled = true;
    if (!runtime) return;
    const offset = runtime.mesh.position.clone().sub(new Vector3(...runtime.originalTransform.position));
    const valid = [offset.x, offset.y, offset.z].every(Number.isFinite) && offset.length() <= MAX_EXPLODED_OFFSET;
    if (!valid) {
      runtime.mesh.position.set(...(explodedTargets.get(runtime.partId) ?? runtime.explodedTransform.position));
      setTransformError(true);
      return;
    }
    setPartExplodedOffset(runtime.partId, { x: offset.x, y: offset.y, z: offset.z });
  }
  useEffect(() => () => {
    isTransformDraggingRef.current = false;
    if (controlsRef.current) controlsRef.current.enabled = true;
  }, [controlsRef]);

  useEffect(() => {
    if (hasInitializedPartsRef.current) {
      return;
    }

    const extractedParts =
      extractModelParts(model);

    const mergedParts = mergeModelParts(
      extractedParts,
      savedParts,
    );

    setParts(mergedParts);
    hasInitializedPartsRef.current = true;
  }, [model, savedParts, setParts]);

  useEffect(() => {
    onModelReady?.(model);
  }, [model, onModelReady]);

  useEffect(() => {
    syncModelParts({
      model,
      parts: presentationParts,
      palette,
      viewerMode,
      baseColor,
      selectedPartId,
      selectedPartIds,
      highlightedPaletteColorId,
    });
  }, [
    model,
    presentationParts,
    palette,
    viewerMode,
    baseColor,
    selectedPartId,
    selectedPartIds,
    highlightedPaletteColorId,
  ]);

  useEffect(() => {
    return () => {
      disposeModelMaterials(model);
    };
  }, [model]);

  function handlePointerDown(
    event: ThreeEvent<PointerEvent>,
  ) {
    event.stopPropagation();

    const clickedMesh = event.object;

    if (!(clickedMesh instanceof Mesh)) {
      return;
    }

    const clickedPart = parts.find(
      (part) =>
        part.meshUuid === clickedMesh.uuid,
    );

    if (!clickedPart) {
      return;
    }

    if (selectionMode === "assignPalette") {
      toggleSelectedPart(clickedPart.id);
    } else {
      selectPart(clickedPart.id);
    }
  }

  return (
    <>
      <primitive
        object={model}
        onPointerDown={handlePointerDown}
      />

    {viewerMode === "numbers" ? (
      <ModelNumberLabels
        model={model}
        parts={presentationParts}
        palette={palette}
        selectedPartId={selectedPartId}
        selectedPartIds={selectedPartIds}
        highlightedPaletteColorId={
          highlightedPaletteColorId
        }
        showAllForCapture={
          showAllNumberCalloutsForCapture
        }
      />
    ) : null}
    {viewerMode==="exploded"&&!forceAssembled?<ExplodedPartLabels layout={explodedLayout} parts={presentationParts} mode={explodedLabelsMode}/>:null}
    {viewerMode==="exploded"&&isExplodedLayoutEditing&&!forceAssembled&&editingRuntime&&editingPart?.visible?<TransformControls object={editingRuntime.mesh} mode="translate" space="local" onMouseDown={handleTransformStart} onMouseUp={handleTransformEnd}/>:null}
    {transformError?<Html center><div className="whitespace-nowrap rounded-xl border border-red-400/20 bg-black/85 px-4 py-3 text-sm text-red-300">{t("exploded.savePositionFailed")}</div></Html>:null}
    {viewerMode==="exploded"&&parts.length>1&&explodedLayout.length===0?<Html center><div className="whitespace-nowrap rounded-xl border border-red-400/20 bg-black/85 px-4 py-3 text-sm text-red-300">{t("exploded.layoutFailed")}</div></Html>:null}
    </>
  );
}
