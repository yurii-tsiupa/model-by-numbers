import type {PaintingStageType} from "@/features/model-editor/types/PaintingWorkflow";
export type GuideImageSource={src:string;width:number;height:number;kind:"generated"};
export type GuideStepPreviewState={status:"ready";image:GuideImageSource;alt:string}|{status:"loading"}|{status:"unavailable";reason?:"general"|"missing-targets"|"generation-failed"};
export type GuidePaintingStepViewModel={id:string;partId:string;order:number;title:string;instruction:string;stageType:PaintingStageType;targetSummary:string;targetLabels:string[];cacheKey:string|null;preview:GuideStepPreviewState};
