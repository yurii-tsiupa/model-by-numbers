import type {ManualDetail} from "@/features/models/types/ManualDetail";
import type {PaletteColor} from "@/features/models/types/PaletteColor";
import {useModelEditorStore} from "../store/modelEditorStore";
import type {PaintingStage} from "../types/PaintingWorkflow";
import {STEP_PREVIEW_RENDERER_VERSION} from "./constants";
export function getStepPreviewCacheKey(projectId:string,step:PaintingStage,parts:readonly {id:string;meshUuid?:string;paletteColorId?:string|null}[],manualDetails:readonly ManualDetail[],palette:readonly Pick<PaletteColor,"id"|"hex">[]=useModelEditorStore.getState().palette){
 const partById=new Map(parts.map(part=>[part.id,part])),detailById=new Map(manualDetails.map(detail=>[detail.id,detail])),colors=new Map(palette.map(color=>[color.id,color.hex]));
 return JSON.stringify({v:STEP_PREVIEW_RENDERER_VERSION,projectId,stepId:step.id,refs:(step.targetReferences??[]).map(reference=>{if(reference.type==="part"){const part=partById.get(reference.id);return{...reference,mesh:part?.meshUuid,color:part?.paletteColorId?colors.get(part.paletteColorId):null}}const detail=detailById.get(reference.id);return{type:"manualDetail",id:reference.id,number:detail?.number,updatedAt:detail?.updatedAt,color:detail?.colorId?colors.get(detail.colorId):null,pins:detail?.pins.map(pin=>({id:pin.id,position:pin.position,normal:pin.normal,camera:pin.camera,updatedAt:pin.updatedAt}))}})});
}
