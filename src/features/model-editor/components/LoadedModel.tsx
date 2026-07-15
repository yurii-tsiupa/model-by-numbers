"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Mesh,
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
import { ProjectPart } from "@/features/models/types/ProjectPart";
import { mergeModelParts } from "../lib/mergeModelParts";
import { ViewerMode } from "../types/ViewerMode";

type LoadedModelProps = {
  modelUrl: string;
  savedParts: ProjectPart[];
  viewerMode: ViewerMode;
  baseColor: string;
  onModelReady?: (
    model: Object3D,
  ) => void;
};

export function LoadedModel({
  modelUrl,
  savedParts,
  viewerMode,
  baseColor,
  onModelReady,
}: LoadedModelProps) {
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

  const model = useMemo(() => {
    const normalizedModel = normalizeModel(
      gltf.scene,
    );

    prepareModelMeshes(normalizedModel);

    return normalizedModel;
  }, [gltf.scene]);

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
      parts,
      palette,
      viewerMode,
      baseColor,
      selectedPartId,
      selectedPartIds,
      highlightedPaletteColorId,
    });
  }, [
    model,
    parts,
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
    <primitive
      object={model}
      onPointerDown={handlePointerDown}
    />
  );
}