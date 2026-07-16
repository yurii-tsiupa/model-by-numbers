"use client";
import {createContext,useContext,type ReactNode} from "react";import {DEFAULT_IMPORT_TRANSFORM,type ImportTransform} from "../types/ImportTransform";
const Context=createContext<ImportTransform>(DEFAULT_IMPORT_TRANSFORM);
export function ImportTransformPreviewProvider({value,children}:{value:ImportTransform;children:ReactNode}){return <Context.Provider value={value}>{children}</Context.Provider>}
export const useImportTransformPreview=()=>useContext(Context);
