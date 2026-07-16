export const MODEL_FILE_LIMITS={warningSizeMb:25,maximumSizeMb:50} as const;
export const MODEL_IMPORT_THRESHOLDS={mediumTriangles:100_000,heavyTriangles:300_000,veryHeavyTriangles:700_000,manyParts:100,oversizedTextureDimension:4096,offCenterRatio:2,minimumBound:1e-7,maximumBound:1e7} as const;
export const GLB_CAPABILITIES={supportsMultipleParts:true,supportsMaterials:true,supportsTextures:true,supportsHierarchy:true,supportsAnimations:true,requiresManualUnits:true} as const;
export const STL_CAPABILITIES={supportsMultipleParts:false,supportsMaterials:false,supportsTextures:false,supportsHierarchy:false,supportsAnimations:false,requiresManualUnits:true} as const;
