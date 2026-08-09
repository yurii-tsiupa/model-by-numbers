"use client";

import { useEffect, useState } from "react";
import { loadUserBrandBackground } from "../services/userBrandBackgroundStorage";
import type { UserBrandBackgroundAsset } from "../types/UserBrandAssets";

export type ResolvedUserBrandBackgroundAsset = UserBrandBackgroundAsset & { imageUrl: string };

export function useUserBrandBackgroundAssets(assets: readonly UserBrandBackgroundAsset[]): ResolvedUserBrandBackgroundAsset[] {
  const [resolved, setResolved] = useState<ResolvedUserBrandBackgroundAsset[]>([]);
  const signature = assets.map((asset) => `${asset.id}:${asset.localAssetId}:${asset.name ?? ""}`).join("|");
  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    void Promise.all(assets.map(async (asset) => {
      const blob = await loadUserBrandBackground(asset.localAssetId).catch(() => null);
      if (!blob) return null;
      const imageUrl = URL.createObjectURL(blob); urls.push(imageUrl); return { ...asset, imageUrl };
    })).then((items) => { if (active) setResolved(items.filter((item): item is ResolvedUserBrandBackgroundAsset => item !== null)); });
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
    // signature captures all stable metadata that affects resolved output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return resolved;
}
