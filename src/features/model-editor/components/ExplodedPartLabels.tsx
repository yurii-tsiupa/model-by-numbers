"use client";
import {Html,Line} from "@react-three/drei";
import {createPortal} from "@react-three/fiber";
import type {ModelPart} from "../types/ModelPart";
import type {RuntimeExplodedPart} from "../types/RuntimeExplodedPart";
import type {ExplodedLabelsMode} from "../types/ExplodedLabelsMode";
export function ExplodedPartLabels({layout,parts,mode,predicate}: {layout:readonly RuntimeExplodedPart[];parts:readonly ModelPart[];mode:ExplodedLabelsMode;predicate?:(part:ModelPart)=>boolean}){if(mode==="none")return null;const byId=new Map(parts.map(part=>[part.id,part]));return <>{layout.map(runtime=>{const part=byId.get(runtime.partId);if(!part||!part.visible||(predicate&&!predicate(part)))return null;const number=String(part.index+1).padStart(2,"0");const anchor=runtime.anchor;const label:[number,number,number]=[anchor[0],anchor[1]+0.28,anchor[2]];return createPortal(<><Line points={[anchor,label]} color="#d4d4d8" lineWidth={0.8} depthTest={false}/><Html position={label} center style={{pointerEvents:"none"}}><div className="select-none whitespace-nowrap rounded-lg border border-white/15 bg-black/85 px-2 py-1 text-center text-[10px] font-semibold text-white shadow-xl">{number}{mode==="numbers-and-names"?<span className="ml-1.5 text-neutral-300">{part.name}</span>:null}</div></Html></>,runtime.mesh);})}</>}
