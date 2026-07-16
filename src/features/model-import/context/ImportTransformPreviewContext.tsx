"use client";
import {createContext,useContext,type MutableRefObject,type ReactNode} from "react";import {DEFAULT_IMPORT_TRANSFORM,type ImportTransform} from "../types/ImportTransform";
export type ImportPreviewCapture=()=>Promise<string>;
type Value={transform:ImportTransform;includedMeshUuids:ReadonlySet<string>;captureRef:MutableRefObject<ImportPreviewCapture|null>};
const emptyRef:{current:ImportPreviewCapture|null}={current:null};const Context=createContext<Value>({transform:DEFAULT_IMPORT_TRANSFORM,includedMeshUuids:new Set(),captureRef:emptyRef});
export function ImportTransformPreviewProvider({transform,includedMeshUuids,captureRef,children}:{transform:ImportTransform;includedMeshUuids:ReadonlySet<string>;captureRef:MutableRefObject<ImportPreviewCapture|null>;children:ReactNode}){return <Context.Provider value={{transform,includedMeshUuids,captureRef}}>{children}</Context.Provider>}
export const useImportTransformPreview=()=>useContext(Context);
