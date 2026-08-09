import { createContext, useContext, type ReactNode } from "react";

type GuidePdfBrandAssets = {
  qrImageUrl: string | null;
};

const GuidePdfBrandAssetsContext = createContext<GuidePdfBrandAssets>({ qrImageUrl: null });

export function GuidePdfBrandAssetsProvider({ children, qrImageUrl }: { children: ReactNode; qrImageUrl: string | null }) {
  return <GuidePdfBrandAssetsContext.Provider value={{ qrImageUrl }}>{children}</GuidePdfBrandAssetsContext.Provider>;
}

export const useGuidePdfBrandAssets = () => useContext(GuidePdfBrandAssetsContext);
