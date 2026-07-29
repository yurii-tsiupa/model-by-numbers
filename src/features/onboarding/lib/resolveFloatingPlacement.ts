import type {TourPlacement} from "../types/onboarding.types";

type Side=Exclude<TourPlacement,"auto">;
type Options={width:number;height:number;gap?:number;margin?:number;order:readonly Side[]};

export function resolveFloatingPlacement(target:DOMRect,{width,height,gap=12,margin=12,order}:Options){
  const viewportWidth=window.innerWidth,viewportHeight=window.innerHeight;
  const fits:Record<Side,boolean>={
    right:viewportWidth-target.right>=width+gap+margin,
    left:target.left>=width+gap+margin,
    bottom:viewportHeight-target.bottom>=height+gap+margin,
    top:target.top>=height+gap+margin,
  };
  const placement=order.find(side=>fits[side])??order[0];
  let left=target.left+target.width/2-width/2,top=target.bottom+gap;
  if(placement==="top")top=target.top-height-gap;
  if(placement==="right"){left=target.right+gap;top=target.top+target.height/2-height/2}
  if(placement==="left"){left=target.left-width-gap;top=target.top+target.height/2-height/2}
  return{
    left:Math.max(margin,Math.min(viewportWidth-width-margin,left)),
    top:Math.max(margin,Math.min(viewportHeight-height-margin,top)),
    placement,
  };
}
