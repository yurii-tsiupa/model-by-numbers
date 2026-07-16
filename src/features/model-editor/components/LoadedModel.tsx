"use client";

import {Html,useGLTF} from "@react-three/drei";
import {useFrame,type ThreeEvent} from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Mesh,
  MathUtils,
  type Object3D,
} from "three";
import type { GLTF } from "three-stdlib";

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

type LoadedModelProps = {
  modelUrl: string;
  savedParts: ProjectPart[];
  viewerMode: ViewerMode;
  baseColor: string;
  showAllNumberCalloutsForCapture: boolean;
  showAllPartsForCapture: boolean;
  forceAssembled:boolean;
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
  onModelReady,
}: LoadedModelProps) {
  const {t}=useTranslation();
  const gltf = useGLTF(modelUrl) as GLTF;

  const hasInitializedPartsRef = useRef(false);

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
  useEffect(()=>()=>{for(const runtime of explodedLayout){runtime.mesh.position.set(...runtime.originalTransform.position);runtime.mesh.rotation.set(...runtime.originalTransform.rotation);runtime.mesh.scale.set(...runtime.originalTransform.scale);}},[explodedLayout]);
  useFrame((_,delta)=>{const factor=viewerMode==="exploded"&&!forceAssembled?explosionFactor:0;for(const runtime of explodedLayout){const target=runtime.originalTransform.position.map((value,index)=>MathUtils.lerp(value,runtime.explodedTransform.position[index],factor)) as [number,number,number];if(forceAssembled){runtime.mesh.position.set(...runtime.originalTransform.position);}else{runtime.mesh.position.set(MathUtils.damp(runtime.mesh.position.x,target[0],EXPLOSION_DAMPING,delta),MathUtils.damp(runtime.mesh.position.y,target[1],EXPLOSION_DAMPING,delta),MathUtils.damp(runtime.mesh.position.z,target[2],EXPLOSION_DAMPING,delta));}runtime.mesh.rotation.set(...runtime.originalTransform.rotation);runtime.mesh.scale.set(...runtime.originalTransform.scale);}});

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
    {viewerMode==="exploded"&&parts.length>1&&explodedLayout.length===0?<Html center><div className="whitespace-nowrap rounded-xl border border-red-400/20 bg-black/85 px-4 py-3 text-sm text-red-300">{t("exploded.layoutFailed")}</div></Html>:null}
    </>
  );
}
