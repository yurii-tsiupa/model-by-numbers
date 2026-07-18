"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type { GuideRenderMode } from "../types/GuideRenderMode";

type GuideRenderModeProviderProps = {
  mode: GuideRenderMode;
  children: ReactNode;
};

const GuideRenderModeContext =
  createContext<GuideRenderMode>(
    "preview",
  );

export function GuideRenderModeProvider({
  mode,
  children,
}: GuideRenderModeProviderProps) {
  return (
    <GuideRenderModeContext.Provider
      value={mode}
    >
      {children}
    </GuideRenderModeContext.Provider>
  );
}

export function useGuideRenderMode() {
  return useContext(
    GuideRenderModeContext,
  );
}