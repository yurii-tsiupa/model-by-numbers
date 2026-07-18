import type { Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { createStlScene } from "@/features/model-import/lib/createStlScene";
import type { ModelFormat } from "@/features/model-import/types/ModelFormat";
import { getModelFile } from "../services/model-file.service";
import { extractModelParts } from "../lib/extractModelParts";
import { mergeModelParts } from "../lib/mergeModelParts";
import { normalizeModel } from "../lib/normalizeModel";
import type { ModelPart } from "../types/ModelPart";
import type { ProjectPart } from "@/features/models/types/ProjectPart";

export async function loadStepPreviewModel({
  projectId,
  userId,
  modelFormat,
  savedParts,
}: {
  projectId: string;
  userId: string;
  modelFormat: ModelFormat;
  savedParts: ProjectPart[];
}): Promise<{ model: Object3D; parts: ModelPart[] }> {
  const file = await getModelFile({ projectId, userId });
  if (!file) throw new Error("modelUnavailable");
  const buffer = await file.arrayBuffer();
  let source: Object3D;
  if (modelFormat === "stl") {
    source = createStlScene(new STLLoader().parse(buffer), file.name);
  } else {
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, "");
    source = gltf.scene;
  }
  const model = normalizeModel(source);
  const parts = mergeModelParts(extractModelParts(model), savedParts, true);
  return { model, parts };
}
