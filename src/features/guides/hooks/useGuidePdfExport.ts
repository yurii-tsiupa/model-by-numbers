"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {exportGuidePdf} from "../services/pdf/exportGuidePdf";
import {normalizePdfExportError,type PdfExportError} from "../services/pdf/pdfExportErrors";
import type {ExportGuidePdfOptions,PdfExportStatus} from "../services/pdf/types";

const ACTIVE=new Set<PdfExportStatus>(["preparing","loadingAssets","rendering","generating"]);

export function useGuidePdfExport(options:Omit<ExportGuidePdfOptions,"onProgress">){
  const optionsRef=useRef(options);
  const runningRef=useRef(false);
  const mountedRef=useRef(true);
  const[status,setStatus]=useState<PdfExportStatus>("idle");
  const[progress,setProgress]=useState(0);
  const[error,setError]=useState<PdfExportError|null>(null);

  useEffect(()=>{optionsRef.current=options;},[options]);
  useEffect(()=>{mountedRef.current=true;return()=>{mountedRef.current=false;};},[]);

  const exportPdf=useCallback(async()=>{
    if(runningRef.current)return null;
    runningRef.current=true;
    setError(null);setStatus("preparing");setProgress(15);
    try{
      const result=await exportGuidePdf({...optionsRef.current,onProgress:next=>{if(!mountedRef.current)return;setStatus(next.status);setProgress(next.progress);}});
      if(mountedRef.current){setStatus("success");setProgress(100);}
      return result;
    }catch(runtimeError){
      const normalized=normalizePdfExportError(runtimeError);
      if(process.env.NODE_ENV!=="production")console.error("Guide PDF export failed.",normalized.cause??normalized);
      if(mountedRef.current){setError(normalized);setStatus("error");setProgress(0);}
      return null;
    }finally{runningRef.current=false;}
  },[]);
  const retryExport=useCallback(()=>exportPdf(),[exportPdf]);
  const resetExport=useCallback(()=>{if(runningRef.current)return;setStatus("idle");setProgress(0);setError(null);},[]);
  return{status,progress,error,isExporting:ACTIVE.has(status),exportPdf,retryExport,resetExport} as const;
}
