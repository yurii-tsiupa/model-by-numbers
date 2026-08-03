"use client";
import { useMemo } from "react";
import type { ModelGuide } from "../types/ModelGuide";
import { getGuideViewModel } from "../lib/getGuideViewModel";
import { DEFAULT_GUIDE_PAGE_FORMAT, type GuidePageFormat } from "../types/GuidePageFormat";
export function useGuideViewModel(guide:ModelGuide,pageFormat:GuidePageFormat=DEFAULT_GUIDE_PAGE_FORMAT){return useMemo(()=>getGuideViewModel(guide,pageFormat),[guide,pageFormat]);}
