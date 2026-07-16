export type HealthCategoryStatus="excellent"|"good"|"warning"|"critical";
export type HealthCategory={score:number;status:HealthCategoryStatus};
export type HealthRecommendationCode="too-many-triangles"|"too-many-parts"|"single-mesh"|"hidden-parts"|"duplicate-names"|"technical-names"|"no-materials"|"no-textures"|"oversized-textures"|"extreme-scale"|"unknown-units"|"invalid-geometry"|"orientation-uncertain";
export type HealthRecommendation={code:HealthRecommendationCode;severity:"info"|"warning"|"critical";titleKey:`modelImport.health.recommendations.${HealthRecommendationCode}.title`;descriptionKey:`modelImport.health.recommendations.${HealthRecommendationCode}.description`};
export type ModelHealth={overallScore:number;overallStatus:"excellent"|"good"|"acceptable"|"poor";categories:{geometry:HealthCategory;performance:HealthCategory;structure:HealthCategory;printability:HealthCategory};recommendations:HealthRecommendation[]};
