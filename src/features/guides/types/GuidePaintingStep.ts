import type {PaintingStageType} from "@/features/model-editor/types/PaintingWorkflow";
export type GuideImageSource={src:string;width:number;height:number;kind:"generated"};
export type GuideStepPreviewState={id:string;label:string;status:"ready";image:GuideImageSource;alt:string}|{id:string;label:string;status:"loading"}|{id:string;label:string;status:"unavailable";reason?:"general"|"missing-targets"|"generation-failed"};
export type GuidePaintingStepViewModel={id:string;partId:string;order:number;title:string;instruction:string;stageType:PaintingStageType;targetSummary:string;targetLabels:string[];previews:GuideStepPreviewState[]};
