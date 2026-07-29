"use client";

import {Html,TransformControls} from "@react-three/drei";
import {useFrame,type ThreeEvent} from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box3,
  Mesh,
  BufferGeometry,
  Float32BufferAttribute,
  DoubleSide,
  Matrix3,
  PerspectiveCamera,
  MathUtils,
  Quaternion,
  Vector3,
  type Object3D,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function brushTriangles(mesh:Mesh,faceIndex:number,point:Vector3,radius:number){
  const geometry=mesh.geometry,position=geometry.getAttribute("position"),index=geometry.index,triangleCount=Math.floor((index?.count??position.count)/3),normalMatrix=new Matrix3().getNormalMatrix(mesh.matrixWorld);
  const vertices=(triangle:number)=>[0,1,2].map(offset=>index?index.getX(triangle*3+offset):triangle*3+offset);
  const triangleNormal=(triangle:number)=>{const ids=vertices(triangle),a=new Vector3().fromBufferAttribute(position,ids[0]),b=new Vector3().fromBufferAttribute(position,ids[1]),c=new Vector3().fromBufferAttribute(position,ids[2]);return b.sub(a).cross(c.sub(a)).normalize().applyMatrix3(normalMatrix).normalize()};
  const originNormal=triangleNormal(faceIndex),selected:number[]=[];
  for(let triangle=0;triangle<triangleCount;triangle++){
    const ids=vertices(triangle),centroid=new Vector3();
    for(const id of ids)centroid.add(new Vector3().fromBufferAttribute(position,id));
    centroid.multiplyScalar(1/3).applyMatrix4(mesh.matrixWorld);
    if(centroid.distanceToSquared(point)<=radius*radius&&originNormal.dot(triangleNormal(triangle))>.2)selected.push(triangle);
  }
  return selected.length?selected:[faceIndex];
}
function regionBrushRadius(modelDiagonal:number,value:number){const normalized=Math.max(0,Math.min(1,value/100));return modelDiagonal*(.003+(.08-.003)*normalized**2)}

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
import {useRuntimeModelScene} from "../hooks/useRuntimeModelScene";
import type {ModelFormat} from "@/features/model-import/types/ModelFormat";

type LoadedModelProps = {
  modelUrl: string;
  modelFormat: ModelFormat;
  savedParts: ProjectPart[];
  importSchemaVersion?: 1;
  viewerMode: ViewerMode;
  baseColor: string;
  showAllNumberCalloutsForCapture: boolean;
  showAllPartsForCapture: boolean;
  hideManualDetailPins:boolean;
  forceAssembled:boolean;
  forceFullyExploded: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onModelReady?: (
    model: Object3D,
  ) => void;
};

export function LoadedModel(props: LoadedModelProps) {
  const sourceScene = useRuntimeModelScene(props.modelUrl, props.modelFormat);
  return sourceScene ? <LoadedModelContent {...props} sourceScene={sourceScene} /> : null;
}

function LoadedModelContent({
  sourceScene,
  savedParts,
  importSchemaVersion,
  viewerMode,
  baseColor,
  showAllNumberCalloutsForCapture,
  showAllPartsForCapture,
  hideManualDetailPins,
  forceAssembled,
  forceFullyExploded,
  controlsRef,
  onModelReady,
}: LoadedModelProps & { sourceScene: Object3D }) {
  const {t}=useTranslation();
  const hasInitializedPartsRef = useRef(false);
  const isTransformDraggingRef = useRef(false);
  const [transformError, setTransformError] = useState(false);
  const [brushHover,setBrushHover]=useState<{sessionId:string;position:Vector3;normal:Vector3;erase:boolean}|null>(null);

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
  const manualDetails=useModelEditorStore(state=>state.manualDetails);
  const selectedManualDetailId=useModelEditorStore(state=>state.selectedManualDetailId);
  const selectedManualDetailPinId=useModelEditorStore(state=>state.selectedManualDetailPinId);
  const activePaintingStageId=useModelEditorStore(state=>state.activePaintingStageId);
  const manualDetailPlacement=useModelEditorStore(state=>state.simpleTargetMode==="markers"?state.manualDetailPlacement:null);
  const regionPlacement=useModelEditorStore(state=>state.simpleTargetMode==="region"?state.regionPlacement:null);
  const applyRegionTriangles=useModelEditorStore(state=>state.applyRegionTriangles);
  const addDraftManualDetailPin=useModelEditorStore(state=>state.addDraftManualDetailPin);
  const selectManualDetail=useModelEditorStore(state=>state.selectManualDetail);

  const model = useMemo(() => {
    const normalizedModel = normalizeModel(sourceScene);

    prepareModelMeshes(normalizedModel);

    return normalizedModel;
  }, [sourceScene]);
  const modelDiagonal=useMemo(()=>new Box3().setFromObject(model).getSize(new Vector3()).length(),[model]);
  const brushQuaternion=useMemo(()=>brushHover?new Quaternion().setFromUnitVectors(new Vector3(0,0,1),brushHover.normal):undefined,[brushHover]);
  const activePaintingStage = useMemo(() => parts.flatMap((part) => part.paintingWorkflow.stages).find((stage) => stage.id === activePaintingStageId), [activePaintingStageId, parts]);
  const highlightedPaintingPartIds = useMemo(() => activePaintingStage?.targetReferences?.filter((reference) => reference.type === "part").map((reference) => reference.id) ?? [], [activePaintingStage]);
  const highlightedPaintingManualDetailIds=useMemo(()=>new Set(activePaintingStage?.targetReferences?.filter(reference=>reference.type!=="part").map(reference=>reference.id)??[]),[activePaintingStage]);

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
      importSchemaVersion === 1,
    );

    setParts(mergedParts);
    hasInitializedPartsRef.current = true;
  }, [importSchemaVersion, model, savedParts, setParts]);

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
      highlightedPaintingPartIds,
      hideUnmappedMeshes: importSchemaVersion === 1,
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
    highlightedPaintingPartIds,
    importSchemaVersion,
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

    if (manualDetailPlacement) return;

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

  function handleMarkerPlacement(event: ThreeEvent<MouseEvent>) {
    if (!manualDetailPlacement || event.delta > 3) return;
    event.stopPropagation();
    const controls = controlsRef.current;
    const camera = controls?.object;
    if (!controls || !camera) return;
    const surfaceNormal = event.face?.normal.clone().applyMatrix3(new Matrix3().getNormalMatrix(event.object.matrixWorld)).normalize();
    addDraftManualDetailPin({position:{x:event.point.x,y:event.point.y,z:event.point.z},normal:surfaceNormal?{x:surfaceNormal.x,y:surfaceNormal.y,z:surfaceNormal.z}:null,camera:{position:{x:camera.position.x,y:camera.position.y,z:camera.position.z},target:{x:controls.target.x,y:controls.target.y,z:controls.target.z},...(camera instanceof PerspectiveCamera?{zoom:camera.zoom}:{})}});
  }
  function handleRegionPlacement(event:ThreeEvent<PointerEvent>){
    if(!regionPlacement||!(event.object instanceof Mesh)||event.faceIndex===undefined||event.faceIndex===null)return;
    event.stopPropagation();
    const radius=regionBrushRadius(modelDiagonal,regionPlacement.brush);
    const part=parts.find(candidate=>candidate.meshUuid===event.object.uuid);
    applyRegionTriangles(part?.id??event.object.uuid,brushTriangles(event.object,event.faceIndex,event.point,radius));
  }
  function handleRegionHover(event:ThreeEvent<PointerEvent>){
    if(!regionPlacement||!(event.object instanceof Mesh)||!event.face)return;
    event.stopPropagation();
    const radius=regionBrushRadius(modelDiagonal,regionPlacement.brush);
    const normal=event.face.normal.clone().applyMatrix3(new Matrix3().getNormalMatrix(event.object.matrixWorld)).normalize();
    setBrushHover({sessionId:regionPlacement.sessionId,position:event.point.clone().addScaledVector(normal,radius*.012),normal,erase:regionPlacement.erase});
    if(event.buttons===1){if(controlsRef.current)controlsRef.current.enabled=false;handleRegionPlacement(event)}
  }
  const regionOverlays=useMemo(()=>{const rows:Array<{id:string;color:string;geometry:BufferGeometry}>=[],draftId=regionPlacement?.detailId;for(const detail of manualDetails){const selections=detail.id===draftId?regionPlacement?.selections:detail.region?.selections;if(detail.targetMode!=="region"||!selections?.length)continue;const color=palette.find(item=>item.id===detail.colorId)?.hex??"#F97316";for(const selection of selections){const meshUuid=parts.find(part=>part.id===selection.meshId)?.meshUuid??selection.meshId,mesh=model.getObjectByProperty("uuid",meshUuid);if(!(mesh instanceof Mesh))continue;const source=mesh.geometry,position=source.getAttribute("position"),index=source.index,values:number[]=[];for(const triangle of selection.triangleIndices)for(let offset=0;offset<3;offset++){const vertex=index?index.getX(triangle*3+offset):triangle*3+offset;if(vertex>=position.count)continue;const point=new Vector3().fromBufferAttribute(position,vertex).applyMatrix4(mesh.matrixWorld);values.push(point.x,point.y,point.z)}if(values.length){const geometry=new BufferGeometry();geometry.setAttribute("position",new Float32BufferAttribute(values,3));geometry.computeVertexNormals();rows.push({id:`${detail.id}:${selection.meshId}`,color,geometry})}}}return rows},[manualDetails,model,palette,parts,regionPlacement]);
  useEffect(()=>()=>{for(const overlay of regionOverlays)overlay.geometry.dispose()},[regionOverlays]);
  const draftDetailNumber=manualDetailPlacement?.proposedMarkerNumber??1;
  const renderedPins=hideManualDetailPins?[]:[...manualDetails.flatMap(detail=>detail.targetMode==="region"?[]:detail.pins.map((pin,index)=>({pin,detailId:detail.id,detailName:detail.name,detailNumber:detail.markerNumber??detail.number,locationIndex:index+1,colorId:detail.colorId,isDraft:false}))),...(manualDetailPlacement?.pins.map((pin,index)=>({pin,detailId:manualDetailPlacement.detailId??"draft",detailName:manualDetailPlacement.name,detailNumber:draftDetailNumber,locationIndex:index+1,colorId:null,isDraft:true}))??[])];

  return (
    <>
      <primitive
        object={model}
        onPointerDown={handlePointerDown}
        onClick={handleMarkerPlacement}
        onPointerMove={handleRegionHover}
        onPointerUp={(event:ThreeEvent<PointerEvent>)=>{if(controlsRef.current)controlsRef.current.enabled=true;handleRegionPlacement(event)}}
        onPointerOut={()=>setBrushHover(null)}
      />
      {regionOverlays.map(overlay=><mesh key={overlay.id} geometry={overlay.geometry} renderOrder={8}><meshStandardMaterial color={overlay.color} emissive={overlay.color} emissiveIntensity={.18} transparent opacity={.78} depthWrite={false} side={DoubleSide} polygonOffset polygonOffsetFactor={-2}/></mesh>)}
      {brushHover&&brushQuaternion&&brushHover.sessionId===regionPlacement?.sessionId?<mesh position={brushHover.position} quaternion={brushQuaternion} renderOrder={12}><ringGeometry args={[regionBrushRadius(modelDiagonal,regionPlacement.brush)*.82,regionBrushRadius(modelDiagonal,regionPlacement.brush),48]}/><meshBasicMaterial color={brushHover.erase?"#ef4444":"#38bdf8"} transparent opacity={.82} depthTest={false} side={DoubleSide}/></mesh>:null}

      {!showAllPartsForCapture?renderedPins.map(({pin,detailId,detailName,detailNumber,locationIndex,colorId,isDraft})=>{const targetHighlighted=highlightedPaintingManualDetailIds.has(detailId),detailSelected=selectedManualDetailId===detailId,pinSelected=selectedManualDetailPinId===pin.id,hasActiveTargets=Boolean(activePaintingStage?.targetReferences?.length),assignedColor=colorId?palette.find(color=>color.id===colorId)?.hex:undefined;return <Html key={pin.id} position={[pin.position.x,pin.position.y,pin.position.z]} center sprite><button type="button" aria-label={t("editor.manualDetails.accessibility.selectLocation",{number:detailNumber,name:detailName,location:locationIndex})} aria-pressed={pinSelected||detailSelected||targetHighlighted} onClick={event=>{event.stopPropagation();if(!isDraft)selectManualDetail(detailId,pin.id)}} style={!pinSelected&&!detailSelected&&!targetHighlighted&&assignedColor?{borderColor:assignedColor}:undefined} className={`grid min-w-7 place-items-center rounded-full border-2 px-1 text-xs font-bold shadow-lg ${targetHighlighted||pinSelected?"h-9 border-[var(--accent-foreground)] bg-[var(--accent)] text-[var(--accent-foreground)]":detailSelected||isDraft?"h-7 border-[var(--accent)] bg-[var(--card)] text-[var(--text)]":`h-7 border-[var(--border)] bg-[var(--card)] text-[var(--text)] ${hasActiveTargets?"opacity-50":""}`}`}>{detailNumber}</button></Html>}) : null}

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
