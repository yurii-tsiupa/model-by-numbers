import { createContext, useContext } from "react";

export type GuidePdfRenderMode = "preview" | "export";

const GuidePdfRenderModeContext = createContext<GuidePdfRenderMode>("export");

export const GuidePdfRenderModeProvider = GuidePdfRenderModeContext.Provider;

export function useGuidePdfRenderMode(): GuidePdfRenderMode {
  return useContext(GuidePdfRenderModeContext);
}
