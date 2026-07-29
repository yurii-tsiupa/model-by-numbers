"use client";

import {useModelEditorStore} from "../store/modelEditorStore";

export function useSimplePartSelection(){
  const parts=useModelEditorStore(state=>state.parts);
  const selectedPartId=useModelEditorStore(state=>state.selectedPartId);
  const hasSinglePart=parts.length===1;

  return{
    parts,
    selectedPartId,
    activePartId:selectedPartId??(hasSinglePart?parts[0].id:null),
    showPartSelector:parts.length>=2,
  };
}
