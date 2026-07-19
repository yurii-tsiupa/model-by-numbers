import {
  AmbientLight,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";

import type { ManualDetail } from "@/features/models/types/ManualDetail";
import type { PaletteColor } from "@/features/models/types/PaletteColor";

import { resolvePaintingTargetReferences } from "../lib/paintingTargets";
import type { ModelPart } from "../types/ModelPart";
import type { PaintingStage,PaintingStepPreviewShot } from "../types/PaintingWorkflow";
import {
  STEP_PREVIEW_ASPECT_RATIO,
  STEP_PREVIEW_HEIGHT,
  STEP_PREVIEW_THEME,
  STEP_PREVIEW_WIDTH,
} from "./constants";
import { getStepPreviewFraming } from "./getStepPreviewFraming";
import type { StepPreviewFraming } from "./types";

let sharedRenderer: WebGLRenderer | null = null;
let sharedCanvas: HTMLCanvasElement | null = null;

function getRenderer(): { canvas: HTMLCanvasElement; renderer: WebGLRenderer } {
  if (sharedRenderer && sharedCanvas) return { canvas: sharedCanvas, renderer: sharedRenderer };
  const canvas = document.createElement("canvas");
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(STEP_PREVIEW_WIDTH, STEP_PREVIEW_HEIGHT, false);
  renderer.outputColorSpace = "srgb";
  sharedCanvas = canvas;
  sharedRenderer = renderer;
  return { canvas, renderer };
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error("renderUnavailable")), "image/webp", 0.94);
  });
}

export async function createStepPreviewBlob({
  model,
  step,
  parts,
  manualDetails,
  palette,
  baseColor,
  shot,
}: {
  model: Object3D;
  step: PaintingStage;
  parts: ModelPart[];
  manualDetails: ManualDetail[];
  palette: PaletteColor[];
  baseColor: string;
  shot?:PaintingStepPreviewShot;
}): Promise<{ blob: Blob; framing: StepPreviewFraming }> {
  const resolved = resolvePaintingTargetReferences(step.targetReferences, parts, manualDetails);
  const pinTargets = resolved.manualDetails.flatMap(detail => detail.pins.filter(pin=>!shot||(detail.id===shot.manualDetailId&&pin.id===shot.pinId)).map(pin => ({ pin, number: detail.number })));
  if(shot&&!pinTargets.length)throw new Error("targetsUnavailable");
  if (!resolved.parts.length && !pinTargets.length) throw new Error("targetsUnavailable");

  const { canvas, renderer } = getRenderer();
  const materials: Material[] = [];
  const textures: CanvasTexture[] = [];
  const scene = new Scene();
  scene.background = new Color(STEP_PREVIEW_THEME.background);
  scene.add(new AmbientLight(0xffffff, 1.65));
  const keyLight = new DirectionalLight(0xffffff, 2.35);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);
  const fillLight = new DirectionalLight(0xdde7ff, 0.7);
  fillLight.position.set(-4, 3, -5);
  scene.add(fillLight);

  const clone = model.clone(true);
  const sourceMeshes: Mesh[] = [];
  const cloneMeshes: Mesh[] = [];
  model.traverse(value => { if (value instanceof Mesh) sourceMeshes.push(value); });
  clone.traverse(value => { if (value instanceof Mesh) cloneMeshes.push(value); });
  const partByMesh = new Map(parts.map(part => [part.meshUuid, part]));
  const colors = new Map(palette.map(color => [color.id, color.hex]));
  const targets = new Set(resolved.parts.map(part => part.id));
  const targetBounds = new Box3();

  cloneMeshes.forEach((mesh, index) => {
    const part = partByMesh.get(sourceMeshes[index]?.uuid ?? "");
    const targeted = Boolean(part && targets.has(part.id));
    const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const copies = sourceMaterials.map(source => {
      const copy = source.clone();
      materials.push(copy);
      if ("color" in copy && copy.color instanceof Color) {
        copy.color.set(part?.paletteColorId ? colors.get(part.paletteColorId) ?? baseColor : baseColor);
        if (!targeted) copy.color.lerp(new Color(STEP_PREVIEW_THEME.contextColor), 0.38);
      }
      if (copy instanceof MeshStandardMaterial && targeted) {
        copy.emissive.set(STEP_PREVIEW_THEME.targetEmissive);
        copy.emissiveIntensity = 0.1;
      }
      copy.needsUpdate = true;
      return copy;
    });
    mesh.material = Array.isArray(mesh.material) ? copies : copies[0];
    if (targeted) targetBounds.expandByObject(mesh, true);
  });

  for (const { pin } of pinTargets) targetBounds.expandByPoint(new Vector3(pin.position.x, pin.position.y, pin.position.z));
  const modelBounds = new Box3().setFromObject(clone, true);
  const pins = pinTargets.map(target => target.pin);
  const framing = getStepPreviewFraming(targetBounds, modelBounds, pins.length === 1 && !resolved.parts.length ? pins[0] : undefined);
  const camera = new PerspectiveCamera(42, STEP_PREVIEW_ASPECT_RATIO, 0.01, 1000);
  camera.position.set(framing.cameraPosition.x, framing.cameraPosition.y, framing.cameraPosition.z);
  camera.up.set(framing.up.x, framing.up.y, framing.up.z);
  camera.lookAt(framing.target.x, framing.target.y, framing.target.z);
  const modelSize = modelBounds.getSize(new Vector3()).length();
  camera.near = Math.max(0.001, modelSize / 10000);
  camera.far = Math.max(100, modelSize * 12);
  camera.updateProjectionMatrix();

  for (const { pin, number } of pinTargets) {
    const label = document.createElement("canvas");
    label.width = 256;
    label.height = 256;
    const context = label.getContext("2d");
    if (!context) continue;
    context.fillStyle = STEP_PREVIEW_THEME.markerBackground;
    context.beginPath();
    context.arc(128, 128, 108, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = STEP_PREVIEW_THEME.markerForeground;
    context.font = "bold 128px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(number), 128, 136);
    const texture = new CanvasTexture(label);
    texture.colorSpace = "srgb";
    const material = new SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new Sprite(material);
    textures.push(texture);
    materials.push(material);
    sprite.position.set(pin.position.x, pin.position.y, pin.position.z);
    const size = Math.max(framing.targetRadius * 0.18, modelSize * 0.015);
    sprite.scale.set(size, size, size);
    sprite.renderOrder = 10;
    scene.add(sprite);
  }

  scene.add(clone);
  try {
    renderer.render(scene, camera);
    return { blob: await canvasBlob(canvas), framing };
  } finally {
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
  }
}
