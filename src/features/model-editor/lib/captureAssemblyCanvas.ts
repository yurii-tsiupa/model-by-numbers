const WIDTH=1600;
const HEIGHT=1200;

function toBlob(canvas:HTMLCanvasElement,type:string,quality?:number):Promise<Blob|null>{return new Promise(resolve=>canvas.toBlob(resolve,type,quality));}

export async function captureAssemblyCanvas(source:HTMLCanvasElement):Promise<Blob>{if(source.width<=0||source.height<=0)throw new Error("Invalid canvas.");const output=document.createElement("canvas");output.width=WIDTH;output.height=HEIGHT;const context=output.getContext("2d");if(!context)throw new Error("Canvas conversion unavailable.");context.fillStyle="#151515";context.fillRect(0,0,WIDTH,HEIGHT);const scale=Math.min(WIDTH/source.width,HEIGHT/source.height);const width=source.width*scale,height=source.height*scale;context.drawImage(source,(WIDTH-width)/2,(HEIGHT-height)/2,width,height);const webp=await toBlob(output,"image/webp",0.88);if(webp&&webp.size>0&&webp.type==="image/webp")return webp;const png=await toBlob(output,"image/png");if(!png||png.size<=0)throw new Error("Empty image.");return png;}
