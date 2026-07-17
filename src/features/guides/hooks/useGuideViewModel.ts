"use client";
import { useMemo } from "react";
import type { ModelGuide } from "../types/ModelGuide";
import { getGuideViewModel } from "../lib/getGuideViewModel";
export function useGuideViewModel(guide:ModelGuide){return useMemo(()=>getGuideViewModel(guide),[guide]);}
