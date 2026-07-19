import type { TranslationKey } from "@/features/i18n/locales/en";
import type { PaintingStage,PaintingStagePreset,PaintingStageType } from "../types/PaintingWorkflow";
import { PAINTING_STAGE_TYPES } from "./paintingWorkflow";
type StageLike=(Pick<PaintingStage,"type"|"customName">|Pick<PaintingStagePreset,"type"|"customName">)&{name?:unknown};
export type PaintingStageTranslator=(key:TranslationKey)=>string;
export function getPaintingStageLabel(stage:StageLike,t:PaintingStageTranslator):string{const legacyName=typeof stage.name==="string"?stage.name.trim():"",customName=stage.customName?.trim()||legacyName;if(customName)return customName;if(PAINTING_STAGE_TYPES.includes(stage.type))return t(`painting.stageTypes.${stage.type}`);return String(stage.type||t("painting.stageTypes.custom"));}
export function getPaintingStageTypeLabel(type:PaintingStageType,t:PaintingStageTranslator):string{return t(`painting.stageTypes.${type}`);}
