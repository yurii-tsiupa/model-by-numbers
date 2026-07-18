export type StepPreviewErrorCode = "modelUnavailable" | "targetsUnavailable" | "renderUnavailable" | "generationCancelled" | "unknown";
export type StepPreviewFraming = { cameraPosition:{x:number;y:number;z:number};target:{x:number;y:number;z:number};up:{x:number;y:number;z:number};targetRadius:number };
export type StepPreviewResult = { stepId:string;imageUrl:string;width:number;height:number;generatedAt:number;framing:StepPreviewFraming;cacheKey:string };
