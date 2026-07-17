import { create } from "zustand";

import type { ModelPart } from "../types/ModelPart";
import { PaletteColor } from "@/features/models/types/PaletteColor";
import { syncPaletteFromParts } from "../lib/syncPaletteFromParts";
import { normalizeHexColor } from "../lib/normalizeHexColor";
import { EditorSidebarTab } from "../types/EditorSidebarTab";
import { GeneratePaletteOptions } from "../types/PaletteGeneration";
import { generatePalette } from "../utils/generatePalette";
import { ViewerMode } from "../types/ViewerMode";
import type { ExplodedLabelsMode } from "../types/ExplodedLabelsMode";
import type { ExplodedOffset } from "../types/ExplodedOffset";
import { MAX_EXPLODED_OFFSET } from "../lib/exploded/exploded.constants";
import type { AssemblyStep, CreateAssemblyStepInput, UpdateAssemblyStepInput } from "@/features/models/types/AssemblyStep";
import type { CreatePaintingStageInput, PaintingDifficulty, PartPaintingWorkflow, UpdatePaintingStageInput } from "../types/PaintingWorkflow";
import { normalizePaintingOrder } from "../lib/paintingOrder";

export type EditorSaveStatus =
  | "saved"
  | "dirty"
  | "saving"
  | "error";

export type SelectionMode =
  | "single"
  | "assignPalette";

type ModelEditorState = {
  parts: ModelPart[];
  paintingOrder:string[];
  assemblySteps: AssemblyStep[];
  focusedAssemblyStepId: string | null;
  assemblyFocusSnapshot: {
    partVisibility: Array<{ partId: string; visible: boolean }>;
    viewerMode: ViewerMode;
    selectedPartId: string | null;
  } | null;
  selectedPartId: string | null;

  isDirty: boolean;
  saveStatus: EditorSaveStatus;
  changeVersion: number;
  saveError: string | null;

  palette: PaletteColor[];

  activeSidebarTab: EditorSidebarTab;
  highlightedPaletteColorId: string | null;

  selectionMode: SelectionMode;

  selectedPartIds: string[];

  setSelectedPartIds: (
    partIds: string[],
  ) => void;

  setHighlightedPaletteColorId: (
    colorId: string | null,
  ) => void;

  viewerMode: ViewerMode;
  explosionFactor:number;
  explodedLabelsMode:ExplodedLabelsMode;
  isExplodedLayoutEditing: boolean;
  setExplosionFactor:(factor:number)=>void;
  setExplodedLabelsMode:(mode:ExplodedLabelsMode)=>void;
  resetExplodedViewerState:()=>void;
  startExplodedLayoutEditing: () => void;
  stopExplodedLayoutEditing: () => void;
  setPartExplodedOffset: (partId: string, offset: ExplodedOffset | null) => void;
  resetPartExplodedOffset: (partId: string) => void;
  resetAllExplodedOffsets: () => void;

  setViewerMode: (
    mode: ViewerMode,
  ) => void;

  setActiveSidebarTab: (
    tab: EditorSidebarTab,
  ) => void;

  updatePaletteColor: (
    colorId: string,
    changes: {
      name?: string;
      hex?: string;
    },
  ) => void;

  deletePaletteColor: (
    colorId: string,
  ) => void;

  setPalette: (palette: PaletteColor[]) => void;
  syncPaletteFromParts: () => void;

  setParts: (parts: ModelPart[]) => void;
  hydratePaintingOrder:(partIds:string[])=>void;
  setPaintingOrder:(partIds:string[])=>void;
  movePaintingOrderPart:(partId:string,direction:"up"|"down")=>void;
  movePaintingOrderPartToIndex:(partId:string,targetIndex:number)=>void;
  resetPaintingOrder:()=>void;
  setPartPaintingWorkflow: (partId:string, workflow:PartPaintingWorkflow)=>void;
  addPaintingStage: (partId:string,input:CreatePaintingStageInput)=>void;
  updatePaintingStage: (partId:string,stageId:string,changes:UpdatePaintingStageInput)=>void;
  deletePaintingStage: (partId:string,stageId:string)=>void;
  movePaintingStage: (partId:string,stageId:string,direction:"up"|"down")=>void;
  setPartPaintingNotes:(partId:string,notes:string)=>void;
  setPartPaintBeforeAssembly:(partId:string,value:boolean)=>void;
  setPartPaintingDifficulty:(partId:string,difficulty:PaintingDifficulty|null)=>void;
  setPartEstimatedPaintingTime:(partId:string,minutes:number|null)=>void;
  replacePartPaintingWorkflow:(partId:string,workflow:PartPaintingWorkflow)=>void;
  copyPaintingWorkflowFromPart:(sourcePartId:string,targetPartId:string,replaceDetails:boolean)=>void;
  setAssemblySteps: (steps: AssemblyStep[]) => void;
  addAssemblyStep: (input: CreateAssemblyStepInput) => void;
  updateAssemblyStep: (stepId: string, changes: UpdateAssemblyStepInput) => void;
  deleteAssemblyStep: (stepId: string) => void;
  moveAssemblyStep: (stepId: string, direction: "up" | "down") => void;
  setAssemblyStepImageKey: (stepId: string, imageKey: string | null) => void;
  focusAssemblyStep: (stepId: string) => void;
  exitAssemblyStepFocus: () => void;
  selectPart: (partId: string | null) => void;

  togglePartVisibility: (
    partId: string,
  ) => void;

  setPartIncludedInGuide: (
    partId: string,
    included: boolean,
  ) => void;

  setPartsIncludedInGuide: (
    partIds: string[],
    included: boolean,
  ) => void;

  assignPaletteColor: (
    partId: string,
    paletteColorId: string,
  ) => void;

  createAndAssignPaletteColor: (
    partId: string,
    hex: string,
  ) => void;

  clearPaletteColor: (partId: string) => void;

  addPaletteColor: ({
    name,
    hex,
  }: {
    name: string;
    hex: string;
  }) => void;

  highlightPaletteColor: (
    colorId: string | null,
  ) => void;

  selectPartsByPaletteColor: (
    colorId: string,
  ) => void;

  startAssignPaletteMode: () => void;

  cancelAssignPaletteMode: () => void;

  toggleSelectedPart: (
    partId: string,
  ) => void;

  applyPaletteColorToSelection: (
    paletteColorId: string,
  ) => void;

  generatePalette: (
    options: GeneratePaletteOptions,
  ) => void;

  showAllParts: () => void;
  hideSelectedPart: () => void;
  isolateSelectedPart: () => void;

  markSaving: () => void;
  markSaved: (savedVersion: number) => void;
  markSaveError: (message: string) => void;

  resetEditor: () => void;
};

function markStateDirty(
  state: ModelEditorState,
): Pick<
  ModelEditorState,
  | "isDirty"
  | "saveStatus"
  | "changeVersion"
  | "saveError"
> {
  return {
    isDirty: true,
    saveStatus: "dirty",
    changeVersion: state.changeVersion + 1,
    saveError: null,
  };
}

function getNextPaletteColorNumber(
  palette: PaletteColor[],
): number {
  return (
    palette.reduce(
      (largestNumber, color) =>
        Math.max(largestNumber, color.number),
      0,
    ) + 1
  );
}

function createPaletteColorId(
  palette: PaletteColor[],
  number: number,
): string {
  let candidateId = `color-${number}`;
  let suffix = 1;

  while (
    palette.some((color) => color.id === candidateId)
  ) {
    candidateId = `color-${number}-${suffix}`;
    suffix += 1;
  }

  return candidateId;
}

function createPaletteColorName(
  number: number,
): string {
  return `C${String(number).padStart(2, "0")}`;
}

export const useModelEditorStore =
  create<ModelEditorState>()((set) => ({
    parts: [],
    paintingOrder:[],
    assemblySteps: [],
    focusedAssemblyStepId: null,
    assemblyFocusSnapshot: null,
    selectedPartId: null,

    palette: [],
    activeSidebarTab: "parts",

    highlightedPaletteColorId: null,

    selectionMode: "single",

    selectedPartIds: [],

    viewerMode: "painted",
    explosionFactor:1,
    explodedLabelsMode:"numbers",
    isExplodedLayoutEditing: false,
    setExplosionFactor:(factor)=>set({explosionFactor:Math.min(1,Math.max(0,Number.isFinite(factor)?factor:1))}),
    setExplodedLabelsMode:(explodedLabelsMode)=>set({explodedLabelsMode}),
    resetExplodedViewerState:()=>set({explosionFactor:1,explodedLabelsMode:"numbers"}),
    startExplodedLayoutEditing: () => set(() => ({
      isExplodedLayoutEditing: true,
      explosionFactor: 1,
      selectionMode: "single",
      selectedPartIds: [],
      highlightedPaletteColorId: null,
    })),
    stopExplodedLayoutEditing: () => set({ isExplodedLayoutEditing: false }),
    setPartExplodedOffset: (partId, offset) => {
      set((state) => {
        if (offset && (
          !Number.isFinite(offset.x) ||
          !Number.isFinite(offset.y) ||
          !Number.isFinite(offset.z) ||
          Math.hypot(offset.x, offset.y, offset.z) > MAX_EXPLODED_OFFSET
        )) return state;
        const part = state.parts.find((item) => item.id === partId);
        if (!part) return state;
        const current = part.explodedOffset;
        const unchanged = current === offset || (
          current !== null && offset !== null &&
          current.x === offset.x && current.y === offset.y && current.z === offset.z
        );
        if (unchanged) return state;
        return {
          parts: state.parts.map((item) => item.id === partId ? { ...item, explodedOffset: offset } : item),
          ...markStateDirty(state),
        };
      });
    },
    resetPartExplodedOffset: (partId) => {
      useModelEditorStore.getState().setPartExplodedOffset(partId, null);
    },
    resetAllExplodedOffsets: () => set((state) => {
      if (!state.parts.some((part) => part.explodedOffset !== null)) return state;
      return {
        parts: state.parts.map((part) => part.explodedOffset === null ? part : { ...part, explodedOffset: null }),
        ...markStateDirty(state),
      };
    }),

    setSelectedPartIds: (selectedPartIds) => {
      set({
        selectedPartIds: [...selectedPartIds],
      });
    },

    setHighlightedPaletteColorId: (
      highlightedPaletteColorId,
    ) => {
      set({ highlightedPaletteColorId });
    },

    isDirty: false,
    saveStatus: "saved",
    changeVersion: 0,
    saveError: null,

    setPartPaintingWorkflow:(partId,workflow)=>set((state)=>{const part=state.parts.find(p=>p.id===partId);if(!part||JSON.stringify(part.paintingWorkflow)===JSON.stringify(workflow))return state;return{parts:state.parts.map(p=>p.id===partId?{...p,paintingWorkflow:workflow}:p),...markStateDirty(state)}}),
    addPaintingStage:(partId,input)=>set((state)=>{const part=state.parts.find(p=>p.id===partId);const customName=input.type==="custom"?input.customName?.trim()||null:null,notes=input.notes.trim();if(!part||(input.type==="custom"&&!customName)||(customName?.length??0)>100||notes.length>500||(input.paletteColorId&&!state.palette.some(c=>c.id===input.paletteColorId))||(input.recommendedCoats!==null&&(!Number.isInteger(input.recommendedCoats)||input.recommendedCoats<1||input.recommendedCoats>10)))return state;const now=new Date().toISOString();const stage={...input,customName,notes,id:crypto.randomUUID(),order:part.paintingWorkflow.stages.length+1,createdAt:now,updatedAt:now};return{parts:state.parts.map(p=>p.id===partId?{...p,paintingWorkflow:{...p.paintingWorkflow,stages:[...p.paintingWorkflow.stages,stage]}}:p),...markStateDirty(state)}}),
    updatePaintingStage:(partId,stageId,changes)=>set((state)=>{const part=state.parts.find(p=>p.id===partId),stage=part?.paintingWorkflow.stages.find(s=>s.id===stageId);if(!part||!stage)return state;const type=changes.type??stage.type,customName=type==="custom"?(changes.customName===undefined?stage.customName:changes.customName)?.trim()||null:null;const next={...stage,...changes,type,customName,notes:(changes.notes??stage.notes).trim()};if((type==="custom"&&!customName)||(customName?.length??0)>100||next.notes.length>500||(next.paletteColorId&&!state.palette.some(c=>c.id===next.paletteColorId))||(next.recommendedCoats!==null&&(!Number.isInteger(next.recommendedCoats)||next.recommendedCoats<1||next.recommendedCoats>10)))return state;if(JSON.stringify({...next,updatedAt:stage.updatedAt})===JSON.stringify(stage))return state;next.updatedAt=new Date().toISOString();return{parts:state.parts.map(p=>p.id===partId?{...p,paintingWorkflow:{...p.paintingWorkflow,stages:p.paintingWorkflow.stages.map(s=>s.id===stageId?next:s)}}:p),...markStateDirty(state)}}),
    deletePaintingStage:(partId,stageId)=>set((state)=>{const part=state.parts.find(p=>p.id===partId);if(!part?.paintingWorkflow.stages.some(s=>s.id===stageId))return state;return{parts:state.parts.map(p=>p.id===partId?{...p,paintingWorkflow:{...p.paintingWorkflow,stages:p.paintingWorkflow.stages.filter(s=>s.id!==stageId).map((s,i)=>({...s,order:i+1}))}}:p),...markStateDirty(state)}}),
    movePaintingStage:(partId,stageId,direction)=>set((state)=>{const part=state.parts.find(p=>p.id===partId);if(!part)return state;const stages=[...part.paintingWorkflow.stages],i=stages.findIndex(s=>s.id===stageId),j=direction==="up"?i-1:i+1;if(i<0||j<0||j>=stages.length)return state;[stages[i],stages[j]]=[stages[j],stages[i]];const normalized=stages.map((s,index)=>({...s,order:index+1}));return{parts:state.parts.map(p=>p.id===partId?{...p,paintingWorkflow:{...p.paintingWorkflow,stages:normalized}}:p),...markStateDirty(state)}}),
    setPartPaintingNotes:(partId,notes)=>{const part=useModelEditorStore.getState().parts.find(p=>p.id===partId);if(part&&notes.trim().length<=1500)useModelEditorStore.getState().setPartPaintingWorkflow(partId,{...part.paintingWorkflow,notes:notes.trim()})},
    setPartPaintBeforeAssembly:(partId,value)=>{const part=useModelEditorStore.getState().parts.find(p=>p.id===partId);if(part)useModelEditorStore.getState().setPartPaintingWorkflow(partId,{...part.paintingWorkflow,paintBeforeAssembly:value})},
    setPartPaintingDifficulty:(partId,difficulty)=>{const part=useModelEditorStore.getState().parts.find(p=>p.id===partId);if(part)useModelEditorStore.getState().setPartPaintingWorkflow(partId,{...part.paintingWorkflow,difficulty})},
    setPartEstimatedPaintingTime:(partId,minutes)=>{const part=useModelEditorStore.getState().parts.find(p=>p.id===partId);if(part&&(minutes===null||(Number.isInteger(minutes)&&minutes>=1&&minutes<=1440)))useModelEditorStore.getState().setPartPaintingWorkflow(partId,{...part.paintingWorkflow,estimatedTimeMinutes:minutes})},
    replacePartPaintingWorkflow:(partId,workflow)=>{useModelEditorStore.getState().setPartPaintingWorkflow(partId,workflow)},
    copyPaintingWorkflowFromPart:(sourcePartId,targetPartId,replaceDetails)=>set((state)=>{const source=state.parts.find(p=>p.id===sourcePartId),target=state.parts.find(p=>p.id===targetPartId);if(!source||!target||source.id===target.id||source.paintingWorkflow.stages.length===0)return state;const valid=new Set(state.palette.map(c=>c.id)),now=new Date().toISOString();const stages=source.paintingWorkflow.stages.map((s,i)=>({...s,id:crypto.randomUUID(),order:i+1,paletteColorId:s.paletteColorId&&valid.has(s.paletteColorId)?s.paletteColorId:null,createdAt:now,updatedAt:now}));const workflow=replaceDetails?{...source.paintingWorkflow,stages}:{...target.paintingWorkflow,stages};return{parts:state.parts.map(p=>p.id===targetPartId?{...p,paintingWorkflow:workflow}:p),...markStateDirty(state)}}),

    setParts: (parts) => {
      set((state) => {
        const validIds = new Set(parts.map((part) => part.id));
        const assemblySteps = state.assemblySteps.map((step) => {
          const partIds = step.partIds.filter((id) => validIds.has(id));
          return partIds.length === step.partIds.length ? step : { ...step, partIds, contentVersion: step.contentVersion + 1, updatedAt: new Date().toISOString() };
        });
        const focusedStep = assemblySteps.find((step) => step.id === state.focusedAssemblyStepId);
        return {
        parts,
        paintingOrder:normalizePaintingOrder({paintingOrder:state.paintingOrder,parts}),
        assemblySteps,
        ...(focusedStep && focusedStep.partIds.length > 0 ? {} : { focusedAssemblyStepId: null, assemblyFocusSnapshot: null }),
        selectedPartId: null,
        isDirty: false,
        saveStatus: "saved",
        changeVersion: 0,
        saveError: null,
        };
      });
    },

    setPalette: (palette) => {
      set({
        palette,
      });
    },

    syncPaletteFromParts: () => {
      set((state) => {
        const result = syncPaletteFromParts(
          state.parts,
          state.palette,
        );

        const hasChanges =
          result.palette.length !== state.palette.length ||
          result.parts.some(
            (part, index) =>
              part.paletteColorId !==
                state.parts[index]?.paletteColorId ||
              part.color !== state.parts[index]?.color,
          );

        if (!hasChanges) {
          return state;
        }

        return {
          palette: result.palette,
          parts: result.parts,
          ...markStateDirty(state),
        };
      });
    },

    selectPart: (partId) => {
      set({
        selectedPartId: partId,
        highlightedPaletteColorId: null,
      });
    },

    togglePartVisibility: (partId) => {
      set((state) => ({
        parts: state.parts.map((part) =>
          part.id === partId
            ? {
                ...part,
                visible: !part.visible,
              }
            : part,
        ),
        ...markStateDirty(state),
      }));
    },

    setAssemblySteps: (assemblySteps) => set({ assemblySteps: assemblySteps.map((step) => ({ ...step, partIds: [...step.partIds] })) }),
    addAssemblyStep: (input) => set((state) => {
      const title = input.title.trim();
      const description = input.description.trim();
      const validPartIds = new Set(state.parts.map((part) => part.id));
      const partIds = [...new Set(input.partIds)].filter((id) => validPartIds.has(id));
      if (!title || title.length > 120 || description.length > 1000 || partIds.length === 0) return state;
      const now = new Date().toISOString();
      const nextStep = { id: crypto.randomUUID(), order: state.assemblySteps.length + 1, title, description, partIds, createdAt: now, updatedAt: now, imageKey: null, imageCapturedAt: null, imageContentVersion: null, contentVersion: 1 };
      return {
        assemblySteps: [...state.assemblySteps, nextStep].map((step, index) => ({ ...step, order: index + 1 })),
        ...markStateDirty(state),
      };
    }),
    updateAssemblyStep: (stepId, changes) => set((state) => {
      const step = state.assemblySteps.find((item) => item.id === stepId);
      if (!step) return state;
      const title = changes.title === undefined ? step.title : changes.title.trim();
      const description = changes.description === undefined ? step.description : changes.description.trim();
      const validPartIds = new Set(state.parts.map((part) => part.id));
      const partIds = changes.partIds === undefined ? step.partIds : [...new Set(changes.partIds)].filter((id) => validPartIds.has(id));
      if (!title || title.length > 120 || description.length > 1000 || partIds.length === 0) return state;
      if (title === step.title && description === step.description && partIds.length === step.partIds.length && partIds.every((id, index) => id === step.partIds[index])) return state;
      const focusedPartIds = state.focusedAssemblyStepId === stepId ? new Set(partIds) : null;
      return {
        assemblySteps: state.assemblySteps.map((item) => item.id === stepId ? { ...item, title, description, partIds, contentVersion: item.contentVersion + 1, updatedAt: new Date().toISOString() } : item),
        ...(focusedPartIds ? { parts: state.parts.map((part) => ({ ...part, visible: focusedPartIds.has(part.id) })) } : {}),
        ...markStateDirty(state),
      };
    }),
    deleteAssemblyStep: (stepId) => set((state) => {
      if (!state.assemblySteps.some((step) => step.id === stepId)) return state;
      const snapshot = state.focusedAssemblyStepId === stepId ? state.assemblyFocusSnapshot : null;
      const visibility = snapshot ? new Map(snapshot.partVisibility.map((item) => [item.partId, item.visible])) : null;
      return {
        assemblySteps: state.assemblySteps.filter((step) => step.id !== stepId).map((step, index) => ({ ...step, order: index + 1 })),
        ...(snapshot ? { parts: state.parts.map((part) => ({ ...part, visible: visibility?.get(part.id) ?? true })), viewerMode: snapshot.viewerMode, selectedPartId: snapshot.selectedPartId && state.parts.some((part) => part.id === snapshot.selectedPartId && (visibility?.get(part.id) ?? true)) ? snapshot.selectedPartId : null, focusedAssemblyStepId:null, assemblyFocusSnapshot:null } : {}),
        ...markStateDirty(state),
      };
    }),
    moveAssemblyStep: (stepId, direction) => set((state) => {
      const index = state.assemblySteps.findIndex((step) => step.id === stepId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= state.assemblySteps.length) return state;
      const assemblySteps = [...state.assemblySteps];
      [assemblySteps[index], assemblySteps[targetIndex]] = [assemblySteps[targetIndex], assemblySteps[index]];
      return { assemblySteps: assemblySteps.map((step, stepIndex) => ({ ...step, order: stepIndex + 1, updatedAt: step.id === stepId ? new Date().toISOString() : step.updatedAt })), ...markStateDirty(state) };
    }),
    setAssemblyStepImageKey: (stepId, imageKey) => set((state) => {
      const step = state.assemblySteps.find((item) => item.id === stepId);
      if (!step || step.imageKey === imageKey) return state;
      const capturedAt = imageKey ? new Date().toISOString() : null;
      return { assemblySteps: state.assemblySteps.map((item) => item.id === stepId ? { ...item, imageKey, imageCapturedAt: capturedAt, imageContentVersion: imageKey ? item.contentVersion : null, updatedAt:capturedAt ?? new Date().toISOString() } : item), ...markStateDirty(state) };
    }),
    focusAssemblyStep: (stepId) => set((state) => {
      const step = state.assemblySteps.find((item) => item.id === stepId);
      if (!step) return state;
      const existingIds = new Set(state.parts.map((part) => part.id));
      const focusedIds = new Set(step.partIds.filter((id) => existingIds.has(id)));
      if (focusedIds.size === 0) return state;
      const snapshot = state.assemblyFocusSnapshot ?? {
        partVisibility: state.parts.map((part) => ({ partId: part.id, visible: part.visible })),
        viewerMode: state.viewerMode,
        selectedPartId: state.selectedPartId,
      };
      return { focusedAssemblyStepId:stepId, assemblyFocusSnapshot:snapshot, viewerMode:"exploded", isExplodedLayoutEditing:false, selectedPartId:state.parts.find((part)=>focusedIds.has(part.id))?.id??null, parts:state.parts.map((part)=>({...part,visible:focusedIds.has(part.id)})) };
    }),
    exitAssemblyStepFocus: () => set((state) => {
      if (!state.assemblyFocusSnapshot) return state;
      const snapshot=state.assemblyFocusSnapshot;
      const visibility=new Map(snapshot.partVisibility.map((item)=>[item.partId,item.visible]));
      const restoredParts=state.parts.map((part)=>({...part,visible:visibility.get(part.id)??true}));
      const selectedPartId=snapshot.selectedPartId&&restoredParts.some((part)=>part.id===snapshot.selectedPartId&&part.visible)?snapshot.selectedPartId:null;
      return {parts:restoredParts,viewerMode:snapshot.viewerMode,selectedPartId,focusedAssemblyStepId:null,assemblyFocusSnapshot:null,isExplodedLayoutEditing:false};
    }),

    setPartIncludedInGuide: (partId, included) => {
      set((state) => {
        const part = state.parts.find((item) => item.id === partId);
        if (!part || part.includeInGuide === included) return state;
        return {
          parts: state.parts.map((item) => item.id === partId ? { ...item, includeInGuide: included } : item),
          ...markStateDirty(state),
        };
      });
    },
    hydratePaintingOrder:(paintingOrder)=>set({paintingOrder:[...paintingOrder]}),
    setPaintingOrder:(partIds)=>set((state)=>{const paintingOrder=normalizePaintingOrder({paintingOrder:partIds,parts:state.parts});if(paintingOrder.length===state.paintingOrder.length&&paintingOrder.every((id,i)=>id===state.paintingOrder[i]))return state;return{paintingOrder,...markStateDirty(state)}}),
    movePaintingOrderPart:(partId,direction)=>{const state=useModelEditorStore.getState(),index=state.paintingOrder.indexOf(partId);state.movePaintingOrderPartToIndex(partId,direction==="up"?index-1:index+1)},
    movePaintingOrderPartToIndex:(partId,targetIndex)=>set((state)=>{const current=normalizePaintingOrder({paintingOrder:state.paintingOrder,parts:state.parts}),index=current.indexOf(partId);if(index<0||targetIndex<0||targetIndex>=current.length||index===targetIndex)return state;const next=[...current];next.splice(index,1);next.splice(targetIndex,0,partId);return{paintingOrder:next,...markStateDirty(state)}}),
    resetPaintingOrder:()=>{const state=useModelEditorStore.getState();state.setPaintingOrder(state.parts.map(p=>p.id))},

    setPartsIncludedInGuide: (partIds, included) => {
      set((state) => {
        const ids = new Set(partIds);
        const hasChanges = state.parts.some((part) => ids.has(part.id) && part.includeInGuide !== included);
        if (!hasChanges) return state;
        return {
          parts: state.parts.map((part) => ids.has(part.id) && part.includeInGuide !== included ? { ...part, includeInGuide: included } : part),
          ...markStateDirty(state),
        };
      });
    },

    assignPaletteColor: (
      partId,
      paletteColorId,
    ) => {
      set((state) => {
        const paletteColorExists = state.palette.some(
          (color) => color.id === paletteColorId,
        );

        if (!paletteColorExists) {
          return state;
        }

        const selectedPart = state.parts.find(
          (part) => part.id === partId,
        );

        if (
          !selectedPart ||
          selectedPart.paletteColorId === paletteColorId
        ) {
          return state;
        }

        return {
          parts: state.parts.map((part) =>
            part.id === partId
              ? {
                  ...part,
                  color: null,
                  paletteColorId,
                }
              : part,
          ),
          ...markStateDirty(state),
        };
      });
    },

    createAndAssignPaletteColor: (
      partId,
      hex,
    ) => {
      set((state) => {
        const normalizedHex = normalizeHexColor(hex);

        if (!normalizedHex) {
          return state;
        }

        const existingColor = state.palette.find(
          (color) =>
            normalizeHexColor(color.hex) === normalizedHex,
        );

        if (existingColor) {
          const selectedPart = state.parts.find(
            (part) => part.id === partId,
          );

          if (
            !selectedPart ||
            selectedPart.paletteColorId ===
              existingColor.id
          ) {
            return state;
          }

          return {
            parts: state.parts.map((part) =>
              part.id === partId
                ? {
                    ...part,
                    color: null,
                    paletteColorId: existingColor.id,
                  }
                : part,
            ),
            ...markStateDirty(state),
          };
        }

        const number = getNextPaletteColorNumber(
          state.palette,
        );

        const newPaletteColor: PaletteColor = {
          id: createPaletteColorId(
            state.palette,
            number,
          ),
          number,
          name: createPaletteColorName(number),
          hex: normalizedHex,
        };

        return {
          palette: [...state.palette, newPaletteColor],
          parts: state.parts.map((part) =>
            part.id === partId
              ? {
                  ...part,
                  color: null,
                  paletteColorId: newPaletteColor.id,
                }
              : part,
          ),
          ...markStateDirty(state),
        };
      });
    },

    clearPaletteColor: (partId) => {
      set((state) => {
        const selectedPart = state.parts.find(
          (part) => part.id === partId,
        );

        if (
          !selectedPart ||
          (!selectedPart.paletteColorId &&
            !selectedPart.color)
        ) {
          return state;
        }

        return {
          parts: state.parts.map((part) =>
            part.id === partId
              ? {
                  ...part,
                  color: null,
                  paletteColorId: null,
                }
              : part,
          ),
          ...markStateDirty(state),
        };
      });
    },

    setActiveSidebarTab: (activeSidebarTab) => {
      set({
        activeSidebarTab,
      });
    },

    updatePaletteColor: (
      colorId,
      changes,
    ) => {
      set((state) => {
        const existingColor = state.palette.find(
          (color) => color.id === colorId,
        );

        if (!existingColor) {
          return state;
        }

        const normalizedHex =
          changes.hex !== undefined
            ? normalizeHexColor(changes.hex)
            : existingColor.hex;

        if (!normalizedHex) {
          return state;
        }

        const nextName =
          changes.name !== undefined
            ? changes.name.trim()
            : existingColor.name;

        const nextColor = {
          ...existingColor,
          name: nextName || existingColor.name,
          hex: normalizedHex,
        };

        if (
          nextColor.name === existingColor.name &&
          nextColor.hex === existingColor.hex
        ) {
          return state;
        }

        return {
          palette: state.palette.map((color) =>
            color.id === colorId
              ? nextColor
              : color,
          ),
          ...markStateDirty(state),
        };
      });
    },

    deletePaletteColor: (colorId) => {
      set((state) => {
        const usageCount = state.parts.filter(
          (part) =>
            part.paletteColorId === colorId,
        ).length;

        if (usageCount > 0) {
          return state;
        }

        const colorExists = state.palette.some(
          (color) => color.id === colorId,
        );

        if (!colorExists) {
          return state;
        }

        return {
          palette: state.palette.filter(
            (color) => color.id !== colorId,
          ),
          parts: state.parts.map((part)=>part.paintingWorkflow.stages.some(stage=>stage.paletteColorId===colorId)?{...part,paintingWorkflow:{...part.paintingWorkflow,stages:part.paintingWorkflow.stages.map(stage=>stage.paletteColorId===colorId?{...stage,paletteColorId:null,updatedAt:new Date().toISOString()}:stage)}}:part),
          ...markStateDirty(state),
        };
      });
    },

    addPaletteColor: ({ name, hex }) => {
      set((state) => {
        const normalizedHex = normalizeHexColor(hex);

        if (!normalizedHex) {
          return state;
        }

        const existingColor = state.palette.find(
          (color) =>
            normalizeHexColor(color.hex) === normalizedHex,
        );

        if (existingColor) {
          return {
            highlightedPaletteColorId: existingColor.id,
            activeSidebarTab: "palette",
          };
        }

        const number = getNextPaletteColorNumber(
          state.palette,
        );

        const newColor: PaletteColor = {
          id: createPaletteColorId(
            state.palette,
            number,
          ),
          number,
          name:
            name.trim() ||
            createPaletteColorName(number),
          hex: normalizedHex,
        };

        return {
          palette: [...state.palette, newColor],
          highlightedPaletteColorId: newColor.id,
          ...markStateDirty(state),
        };
      });
    },

    highlightPaletteColor: (colorId) => {
      set((state) => ({
        highlightedPaletteColorId:
          state.highlightedPaletteColorId === colorId
            ? null
            : colorId,
      }));
    },

    selectPartsByPaletteColor: (colorId) => {
      set((state) => {
        const matchingPart = state.parts.find(
          (part) =>
            part.paletteColorId === colorId,
        );

        if (!matchingPart) {
          return {
            highlightedPaletteColorId: colorId,
          };
        }

        return {
          selectedPartId: matchingPart.id,
          highlightedPaletteColorId: colorId,
          activeSidebarTab: "parts",
        };
      });
    },

    startAssignPaletteMode: () => {
      set({
        selectionMode: "assignPalette",
        selectedPartIds: [],
      });
    },

    cancelAssignPaletteMode: () => {
      set({
        selectionMode: "single",
        selectedPartIds: [],
      });
    },

    toggleSelectedPart: (partId) => {
      set((state) => {
        if (
          state.selectionMode !==
          "assignPalette"
        ) {
          return state;
        }

        const exists =
          state.selectedPartIds.includes(partId);

        return {
          selectedPartIds: exists
            ? state.selectedPartIds.filter(
                (id) => id !== partId,
              )
            : [
                ...state.selectedPartIds,
                partId,
              ],
        };
      });
    },

    applyPaletteColorToSelection: (
      paletteColorId,
    ) => {
      set((state) => {
        if (
          state.selectedPartIds.length === 0
        ) {
          return state;
        }

        const lastSelectedPartId =
          state.selectedPartIds.at(-1) ?? null;

        return {
          parts: state.parts.map((part) =>
            state.selectedPartIds.includes(part.id)
              ? {
                  ...part,
                  paletteColorId,
                }
              : part,
          ),

          selectedPartId: lastSelectedPartId,

          selectedPartIds: [],

          highlightedPaletteColorId: null,

          selectionMode: "single",

          ...markStateDirty(state),
        };
      });
    },

    generatePalette: (
      options: GeneratePaletteOptions,
    ) => {
      set((state) => {
        const generated = generatePalette(
          state.parts,
          options,
        );

        return {
          palette: generated.palette,
          parts: generated.parts,
          selectedPartId:
            generated.parts[0]?.id ?? null,
          highlightedPaletteColorId: null,
          ...markStateDirty(state),
        };
      });
    },

    showAllParts: () => {
      set((state) => ({
        parts: state.parts.map((part) => ({
          ...part,
          visible: true,
        })),
        ...markStateDirty(state),
      }));
    },

    hideSelectedPart: () => {
      set((state) => {
        if (!state.selectedPartId) {
          return state;
        }

        return {
          parts: state.parts.map((part) =>
            part.id === state.selectedPartId
              ? {
                  ...part,
                  visible: false,
                }
              : part,
          ),
          selectedPartId: null,
          ...markStateDirty(state),
        };
      });
    },

    isolateSelectedPart: () => {
      set((state) => {
        if (!state.selectedPartId) {
          return state;
        }

        return {
          parts: state.parts.map((part) => ({
            ...part,
            visible:
              part.id === state.selectedPartId,
          })),
          ...markStateDirty(state),
        };
      });
    },

    markSaving: () => {
      set({
        saveStatus: "saving",
        saveError: null,
      });
    },

    markSaved: (savedVersion) => {
      set((state) => {
        const hasNewerChanges =
          state.changeVersion !== savedVersion;

        return {
          isDirty: hasNewerChanges,
          saveStatus: hasNewerChanges
            ? "dirty"
            : "saved",
          saveError: null,
        };
      });
    },

    markSaveError: (message) => {
      set({
        isDirty: true,
        saveStatus: "error",
        saveError: message,
      });
    },

    setViewerMode: (viewerMode) => {
      set((state) => ({
        viewerMode,
        isExplodedLayoutEditing: viewerMode === "exploded"
          ? state.isExplodedLayoutEditing
          : false,
      }));
    },

    resetEditor: () => {
      set({
        parts: [],
        paintingOrder:[],
        assemblySteps: [],
        focusedAssemblyStepId: null,
        assemblyFocusSnapshot: null,
        selectedPartId: null,
        palette: [],
        activeSidebarTab: "parts",
        highlightedPaletteColorId: null,
        selectionMode: "single",
        selectedPartIds: [],
        viewerMode: "painted",
        explosionFactor:1,
        explodedLabelsMode:"numbers",
        isExplodedLayoutEditing: false,
        isDirty: false,
        saveStatus: "saved",
        changeVersion: 0,
        saveError: null,
      });
    },
  }));
