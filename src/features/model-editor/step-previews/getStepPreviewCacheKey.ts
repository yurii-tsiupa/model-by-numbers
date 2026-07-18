import type { ModelPart } from "../types/ModelPart";
import type { PaintMarker } from "@/features/models/types/PaintMarker";
import type { PaintingStage } from "../types/PaintingWorkflow";
import { STEP_PREVIEW_RENDERER_VERSION } from "./constants";
import { useModelEditorStore } from "../store/modelEditorStore";
export function getStepPreviewCacheKey(projectId:string,step:PaintingStage,parts:readonly ModelPart[],markers:readonly PaintMarker[]){const refs=step.targetReferences??[],partById=new Map(parts.map(part=>[part.id,part])),markerById=new Map(markers.map(marker=>[marker.id,marker])),colorById=new Map(useModelEditorStore.getState().palette.map(color=>[color.id,color.hex]));return JSON.stringify({v:STEP_PREVIEW_RENDERER_VERSION,projectId,stepId:step.id,refs:refs.map(ref=>{const colorId=ref.type==="part"?partById.get(ref.id)?.paletteColorId:markerById.get(ref.id)?.colorId;return ref.type==="part"?{...ref,mesh:partById.get(ref.id)?.meshUuid,color:colorId?colorById.get(colorId):null,visible:partById.get(ref.id)?.includeInGuide}:{...ref,updatedAt:markerById.get(ref.id)?.updatedAt,color:colorId?colorById.get(colorId):null}})})}
