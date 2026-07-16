export type OrientationConfidence="low"|"medium"|"high";export type OrientationReason="already-correct"|"lying-on-back"|"lying-on-side"|"upside-down"|"wide-horizontal"|"tall-vertical"|"symmetrical"|"unknown";
export type OrientationSuggestion={rotation:{x:number;y:number;z:number};confidence:OrientationConfidence;reason:OrientationReason};
