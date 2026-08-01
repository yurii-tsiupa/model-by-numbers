import {MathUtils,PerspectiveCamera,Vector3} from "three";

export type MarkerRenderContext="editor"|"step-preview"|"step-custom-view"|"overview-clean"|"overview-marker-map"|"overview-custom-marker-map";
export type MarkerVisualConfig={diameter:number;fontSize:number;outlineWidth:number;shadowBlur:number;leaderLineWidth:number};

const CONFIG:Record<MarkerRenderContext,MarkerVisualConfig>={
 editor:{diameter:28,fontSize:12,outlineWidth:2,shadowBlur:3,leaderLineWidth:1},
 "step-preview":{diameter:28,fontSize:15,outlineWidth:2,shadowBlur:3,leaderLineWidth:1},
 "step-custom-view":{diameter:28,fontSize:15,outlineWidth:2,shadowBlur:3,leaderLineWidth:1},
 "overview-clean":{diameter:28,fontSize:15,outlineWidth:2,shadowBlur:3,leaderLineWidth:1},
 "overview-marker-map":{diameter:22,fontSize:12,outlineWidth:1.75,shadowBlur:2,leaderLineWidth:1},
 "overview-custom-marker-map":{diameter:22,fontSize:12,outlineWidth:1.75,shadowBlur:2,leaderLineWidth:1},
};

export function usesCompactMarkerVisuals(context:MarkerRenderContext):boolean{
 return context==="overview-marker-map"||context==="overview-custom-marker-map";
}

export function resolveMarkerVisualConfig(context:MarkerRenderContext,output:{width:number;height:number}):MarkerVisualConfig{
 const base=CONFIG[context],resolutionScale=MathUtils.clamp(Math.min(output.width/1200,output.height/800),.8,1.25);
 return{...base,diameter:base.diameter*resolutionScale,fontSize:base.fontSize*resolutionScale,outlineWidth:base.outlineWidth*resolutionScale,shadowBlur:base.shadowBlur*resolutionScale,leaderLineWidth:base.leaderLineWidth*resolutionScale};
}

export function markerWorldDiameter(camera:PerspectiveCamera,position:Vector3,logicalPixels:number,outputHeight:number):number{
 const distance=Math.max(camera.position.distanceTo(position),camera.near),visibleHeight=2*distance*Math.tan(MathUtils.degToRad(camera.fov)/2)/Math.max(camera.zoom,.01);
 return logicalPixels*visibleHeight/Math.max(outputHeight,1);
}
