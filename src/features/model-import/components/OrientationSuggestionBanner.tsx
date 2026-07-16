"use client";

import { Compass } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { OrientationSuggestion } from "../types/OrientationSuggestion";

type Props = { suggestion: OrientationSuggestion | null; hasManualOverride: boolean; onReset: () => void; onReview: () => void };

export function OrientationSuggestionBanner({ suggestion, hasManualOverride, onReset, onReview }: Props) {
  const { t } = useTranslation();
  if (!suggestion || hasManualOverride) return null;
  const applied = suggestion.confidence !== "low";
  return <aside className="mb-4 rounded-2xl border border-orange-400/20 bg-orange-400/[0.06] p-4"><div className="flex items-start gap-3"><Compass className="mt-0.5 h-5 w-5 shrink-0 text-orange-400"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-neutral-100">{t(applied ? "modelImport.orientation.appliedTitle" : "modelImport.orientation.unknownTitle")}</p><p className="mt-1 text-xs leading-5 text-neutral-400">{t(applied ? "modelImport.orientation.appliedDescription" : "modelImport.orientation.unknownDescription")}</p><div className="mt-3 flex flex-wrap gap-2">{applied ? <button type="button" onClick={onReset} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-200 hover:bg-white/5">{t("modelImport.orientation.reset")}</button> : null}<button type="button" onClick={onReview} className="rounded-lg bg-orange-400 px-3 py-2 text-xs font-semibold text-black hover:bg-orange-300">{t("modelImport.orientation.review")}</button></div></div></div></aside>;
}
