import type {OnboardingProgress} from "../types/onboarding.types";

const PREFIX="model-by-numbers:onboarding";
const EMPTY:OnboardingProgress={simpleModeTourVersion:0,stepEditorHintVersion:0,markerHintVersion:0,regionHintVersion:0,explicitlySkipped:false};
const key=(userId:string)=>`${PREFIX}:${userId}`;

export const onboardingStorage={
  read(userId:string):OnboardingProgress{
    if(typeof window==="undefined")return{...EMPTY};
    try{
      const value=JSON.parse(window.localStorage.getItem(key(userId))??"{}") as Partial<OnboardingProgress>;
      return{
        simpleModeTourVersion:Number.isInteger(value.simpleModeTourVersion)?Math.max(0,value.simpleModeTourVersion!):0,
        stepEditorHintVersion:Number.isInteger(value.stepEditorHintVersion)?Math.max(0,value.stepEditorHintVersion!):0,
        markerHintVersion:Number.isInteger(value.markerHintVersion)?Math.max(0,value.markerHintVersion!):0,
        regionHintVersion:Number.isInteger(value.regionHintVersion)?Math.max(0,value.regionHintVersion!):0,
        explicitlySkipped:value.explicitlySkipped===true,
      };
    }catch{return{...EMPTY}}
  },
  write(userId:string,progress:OnboardingProgress){
    if(typeof window==="undefined")return;
    try{window.localStorage.setItem(key(userId),JSON.stringify(progress))}catch{/* Preferences must never break editing. */}
  },
  clear(userId:string){
    if(typeof window==="undefined")return;
    try{window.localStorage.removeItem(key(userId))}catch{/* Preferences must never break editing. */}
  },
};
