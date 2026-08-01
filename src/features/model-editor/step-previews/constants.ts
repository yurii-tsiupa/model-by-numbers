export const STEP_PREVIEW_WIDTH=1200;
export const STEP_PREVIEW_HEIGHT=800;
export const STEP_PREVIEW_ASPECT_RATIO=STEP_PREVIEW_WIDTH/STEP_PREVIEW_HEIGHT;
// Bump whenever baked preview pixels change. This invalidates editable-project
// Step PNGs without mutating historical saved Guide snapshots.
export const STEP_PREVIEW_RENDERER_VERSION=9;
export const STEP_PREVIEW_THEME={background:"#FFFFFF",contextColor:"#C9CBD0",contextOpacity:0.62,targetEmissive:"#6D28D9",markerBackground:"#6D28D9",markerForeground:"#FFFFFF"} as const;
