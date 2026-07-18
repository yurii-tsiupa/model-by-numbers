import {AmbientLight,Box3,CanvasTexture,Color,DirectionalLight,Mesh,MeshStandardMaterial,Object3D,PerspectiveCamera,Scene,Sprite,SpriteMaterial,Vector3,WebGLRenderer,type Material} from "three";
import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {PaletteColor} from "@/features/models/types/PaletteColor";
import {resolvePaintingTargetReferences} from "../lib/paintingTargets";
import type {ModelPart} from "../types/ModelPart";
import type {PaintingStage} from "../types/PaintingWorkflow";
import {STEP_PREVIEW_ASPECT_RATIO,STEP_PREVIEW_HEIGHT,STEP_PREVIEW_THEME,STEP_PREVIEW_WIDTH} from "./constants";
import {getStepPreviewFraming} from "./getStepPreviewFraming";
import type {StepPreviewFraming} from "./types";

export async function createStepPreviewBlob({model,step,parts,manualDetails,palette}:{model:Object3D;step:PaintingStage;parts:ModelPart[];manualDetails:ManualDetail[];palette:PaletteColor[]}):Promise<{blob:Blob;framing:StepPreviewFraming}>{
  const resolved=resolvePaintingTargetReferences(step.targetReferences,parts,manualDetails);
  const pinTargets=resolved.manualDetails.flatMap(detail=>detail.pins.map(pin=>({pin,number:detail.number})));
  const pins=pinTargets.map(target=>target.pin);
  if(!resolved.parts.length&&!pins.length)throw new Error("targetsUnavailable");
  const canvas=document.createElement("canvas");canvas.width=STEP_PREVIEW_WIDTH;canvas.height=STEP_PREVIEW_HEIGHT;
  let renderer:WebGLRenderer|undefined;const materials:Material[]=[],textures:CanvasTexture[]=[];
  try{
    renderer=new WebGLRenderer({canvas,antialias:true});renderer.setSize(STEP_PREVIEW_WIDTH,STEP_PREVIEW_HEIGHT,false);renderer.outputColorSpace="srgb";
    const scene=new Scene();scene.background=new Color(STEP_PREVIEW_THEME.background);scene.add(new AmbientLight(0xffffff,1.7));
    const light=new DirectionalLight(0xffffff,2.4);light.position.set(5,8,6);scene.add(light);
    const clone=model.clone(true),sourceMeshes:Mesh[]=[],cloneMeshes:Mesh[]=[];
    model.traverse(value=>{if(value instanceof Mesh)sourceMeshes.push(value)});clone.traverse(value=>{if(value instanceof Mesh)cloneMeshes.push(value)});
    const partByMesh=new Map(parts.map(part=>[part.meshUuid,part])),colors=new Map(palette.map(color=>[color.id,color])),targets=new Set(resolved.parts.map(part=>part.id)),targetBounds=new Box3(),modelBounds=new Box3().setFromObject(clone,true);
    cloneMeshes.forEach((mesh,index)=>{const part=partByMesh.get(sourceMeshes[index]?.uuid??""),target=Boolean(part&&targets.has(part.id)),source=Array.isArray(mesh.material)?mesh.material:[mesh.material],copies=source.map(material=>{const copy=material.clone();materials.push(copy);if(copy instanceof MeshStandardMaterial){const hex=part?.paletteColorId?colors.get(part.paletteColorId)?.hex:null;if(hex)copy.color.set(hex);if(target){copy.emissive.set(STEP_PREVIEW_THEME.targetEmissive);copy.emissiveIntensity=.12}else{copy.color.lerp(new Color(STEP_PREVIEW_THEME.contextColor),.55);copy.transparent=true;copy.opacity=STEP_PREVIEW_THEME.contextOpacity}}return copy});mesh.material=Array.isArray(mesh.material)?copies:copies[0];if(target)targetBounds.expandByObject(mesh)});
    pins.forEach(pin=>targetBounds.expandByPoint(new Vector3(pin.position.x,pin.position.y,pin.position.z)));
    const framing=getStepPreviewFraming(targetBounds,modelBounds,pins.length===1&&!resolved.parts.length?pins[0]:undefined),camera=new PerspectiveCamera(42,STEP_PREVIEW_ASPECT_RATIO,.01,1000);
    camera.position.set(framing.cameraPosition.x,framing.cameraPosition.y,framing.cameraPosition.z);camera.lookAt(framing.target.x,framing.target.y,framing.target.z);camera.far=Math.max(modelBounds.getSize(new Vector3()).length()*10,100);camera.updateProjectionMatrix();
    for(const {pin,number} of pinTargets){const label=document.createElement("canvas");label.width=128;label.height=128;const context=label.getContext("2d");if(!context)continue;context.fillStyle=STEP_PREVIEW_THEME.markerBackground;context.beginPath();context.arc(64,64,54,0,Math.PI*2);context.fill();context.fillStyle="#FFF";context.font="bold 64px sans-serif";context.textAlign="center";context.textBaseline="middle";context.fillText(String(number),64,68);const texture=new CanvasTexture(label),material=new SpriteMaterial({map:texture}),sprite=new Sprite(material);textures.push(texture);materials.push(material);sprite.position.set(pin.position.x,pin.position.y,pin.position.z);const size=Math.max(framing.targetRadius*.22,.04);sprite.scale.set(size,size,size);scene.add(sprite)}
    scene.add(clone);renderer.render(scene,camera);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("renderUnavailable")),"image/webp",.9));return{blob,framing};
  }finally{textures.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());renderer?.dispose();renderer?.forceContextLoss();canvas.width=1;canvas.height=1}
}
