"use client";

import { useEffect, useMemo, useState } from "react";
import { createGuideObjectUrl } from "@/features/guides/services/assets/createGuideObjectUrl";
import { loadGuideAssetByStorageKey } from "@/features/guides/services/assets/loadGuideAsset";
import type { GuideTemplateSettings } from "../types/GuideLibraryTemplate";

type ResolvedUrls = { logo: string | null; backgrounds: Record<string, string> };

export function useResolvedGuideTemplateAssets(settings: GuideTemplateSettings, projectId: string | undefined): GuideTemplateSettings {
  const assetSignature = [settings.branding.logoAssetId, ...settings.backgroundItems.map((item) => `${item.id}:${item.localAssetId ?? ""}`)].join("|");
  const [urls, setUrls] = useState<ResolvedUrls>({ logo: null, backgrounds: {} });
  useEffect(() => {
    let active = true;
    const owners: Array<{ revoke: () => void }> = [];
    async function hydrate() {
      const logoBlob = settings.branding.logoAssetId ? await loadGuideAssetByStorageKey(settings.branding.logoAssetId).catch(() => null) : null;
      const backgroundBlobs = await Promise.all(settings.backgroundItems.map((item) => item.localAssetId ? loadGuideAssetByStorageKey(item.localAssetId).catch(() => null) : null));
      if (!active) return;
      const logoOwner = logoBlob ? createGuideObjectUrl(logoBlob) : null;
      if (logoOwner) owners.push(logoOwner);
      const backgrounds: Record<string, string> = {};
      settings.backgroundItems.forEach((item, index) => {
        const blob = backgroundBlobs[index];
        if (!blob) return;
        const owner = createGuideObjectUrl(blob); owners.push(owner); backgrounds[item.id] = owner.url;
      });
      setUrls({ logo: logoOwner?.url ?? null, backgrounds });
    }
    if (projectId) void hydrate();
    return () => { active = false; owners.forEach((owner) => owner.revoke()); };
    // assetSignature intentionally captures the complete stable local-asset identity set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetSignature, projectId]);
  return useMemo(() => ({
    ...settings,
    branding: { ...settings.branding, logoUrl: urls.logo ?? settings.branding.logoUrl },
    backgroundItems: settings.backgroundItems.map((item) => ({ ...item, imageUrl: urls.backgrounds[item.id] ?? item.imageUrl })),
  }), [settings, urls]);
}
