"use client";
import {createContext,useContext,type ReactNode} from "react";
import type {GuideRenderMode} from "../types/GuideRenderMode";

const GuideRenderModeContext=createContext<GuideRenderMode>("preview");
export function GuideRenderModeProvider({mode,children}:{mode:GuideRenderMode;children:ReactNode}){return <GuideRenderModeContext.Provider value={mode}>{children}</GuideRenderModeContext.Provider>}
export function useGuideRenderMode(){return useContext(GuideRenderModeContext);}
