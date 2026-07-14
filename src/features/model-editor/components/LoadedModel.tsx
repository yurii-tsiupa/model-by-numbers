"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
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

type LoadedModelProps = {
  modelUrl: string;
  onModelReady?: (model: Object3D) => void;
};

export function LoadedModel({
  modelUrl,
  onModelReady,
}: LoadedModelProps) {
  const gltf = useGLTF(modelUrl) as GLTF;

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

  const model = useMemo(() => {
    const normalizedModel = normalizeModel(
      gltf.scene,
    );

    prepareModelMeshes(normalizedModel);

    return normalizedModel;
  }, [gltf.scene]);

  useEffect(() => {
    const extractedParts =
      extractModelParts(model);

    setParts(extractedParts);
  }, [model, setParts]);

  useEffect(() => {
    onModelReady?.(model);
  }, [model, onModelReady]);

  useEffect(() => {
    syncModelParts({
      model,
      parts,
      selectedPartId,
    });
  }, [
    model,
    parts,
    selectedPartId,
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

    selectPart(clickedPart.id);
  }

  return (
    <primitive
      object={model}
      onPointerDown={handlePointerDown}
    />
  );
}