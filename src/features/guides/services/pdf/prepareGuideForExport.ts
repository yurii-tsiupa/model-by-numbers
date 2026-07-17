import type {GuideSectionId} from "../../lib/getGuideViewModel";
import {PdfExportError} from "./pdfExportErrors";
import {GUIDE_ASSET_TIMEOUT_MS} from "./waitForGuideImages";

export async function prepareGuideForExport(sectionIds:readonly GuideSectionId[]):Promise<HTMLElement>{
  const root=await waitForExportRoot();
  await settleLayout();
  const mounted=new Set(Array.from(root.querySelectorAll<HTMLElement>("[data-guide-section]")).map(section=>section.dataset.guideSection));
  if(sectionIds.some(id=>!mounted.has(id)))throw new PdfExportError("PREPARATION_FAILED");
  return root;
}

function waitForExportRoot():Promise<HTMLElement>{const existing=document.querySelector<HTMLElement>("[data-guide-export-root]");if(existing)return Promise.resolve(existing);return new Promise((resolve,reject)=>{const observer=new MutationObserver(()=>{const root=document.querySelector<HTMLElement>("[data-guide-export-root]");if(root){cleanup();resolve(root);}}),timeout=setTimeout(()=>{cleanup();reject(new PdfExportError("DOCUMENT_NOT_FOUND"));},GUIDE_ASSET_TIMEOUT_MS),cleanup=()=>{clearTimeout(timeout);observer.disconnect();};observer.observe(document.body,{childList:true,subtree:true});});}
function nextFrame(){return new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));}
async function settleLayout(){await nextFrame();await nextFrame();}
