export const GUIDE_ASSET_TIMEOUT_MS=10_000;
export type FailedGuideImage={src:string;alt?:string};
export type ImageLoadResult={total:number;loaded:number;failed:FailedGuideImage[]};

export async function waitForGuideImages(root:HTMLElement,timeoutMs=GUIDE_ASSET_TIMEOUT_MS):Promise<ImageLoadResult>{
  const images=Array.from(root.querySelectorAll("img"));
  const results=await Promise.all(images.map(image=>waitForImage(image,timeoutMs)));
  return{total:images.length,loaded:results.filter(Boolean).length,failed:images.flatMap((image,index)=>results[index]?[]:[{src:image.currentSrc||image.src,alt:image.alt||undefined}])};
}

function waitForImage(image:HTMLImageElement,timeoutMs:number):Promise<boolean>{
  if(image.complete)return Promise.resolve(image.naturalWidth>0);
  return new Promise(resolve=>{
    let settled=false;
    const finish=(loaded:boolean)=>{if(settled)return;settled=true;clearTimeout(timeout);image.removeEventListener("load",handleLoad);image.removeEventListener("error",handleError);resolve(loaded);};
    const handleLoad=()=>{if(typeof image.decode==="function")void image.decode().then(()=>finish(image.naturalWidth>0),()=>finish(image.naturalWidth>0));else finish(image.naturalWidth>0);};
    const handleError=()=>finish(false);
    const timeout=setTimeout(()=>finish(false),timeoutMs);
    image.addEventListener("load",handleLoad,{once:true});
    image.addEventListener("error",handleError,{once:true});
    if(image.complete)finish(image.naturalWidth>0);
  });
}
