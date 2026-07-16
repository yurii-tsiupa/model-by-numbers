import type {AssemblyStep} from "@/features/models/types/AssemblyStep";
import type {ModelPart} from "@/features/model-editor/types/ModelPart";
import {validateAssemblySteps} from "@/features/model-editor/lib/validateAssemblySteps";
import type {GuideSettings} from "../types/ModelGuide";
export type AssemblyGuideReadinessIssue={code:"assembly-invalid"|"step-image-missing";stepId?:string;blocking:boolean};
export function getAssemblyGuideReadiness({settings,assemblySteps,parts}:{settings:GuideSettings;assemblySteps:readonly AssemblyStep[];parts:readonly ModelPart[]}){if(!settings.includeAssemblyInstructions)return {isReady:true,issues:[] as AssemblyGuideReadinessIssue[]};const validation=validateAssemblySteps({steps:assemblySteps,parts});const issues:AssemblyGuideReadinessIssue[]=validation.issues.map(issue=>({code:"assembly-invalid",stepId:issue.stepId,blocking:true}));if(settings.includeAssemblyStepImages)for(const step of assemblySteps)if(!step.imageKey)issues.push({code:"step-image-missing",stepId:step.id,blocking:false});return {isReady:issues.every(issue=>!issue.blocking),issues};}
