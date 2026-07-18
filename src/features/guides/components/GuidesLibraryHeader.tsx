"use client";

import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { formatCount, formatLocalizedNumber, plural } from "@/features/i18n/lib/i18n";

export function GuidesLibraryHeader({ guideCount, modelCount }: { guideCount: number; modelCount: number }) { const { t, locale } = useTranslation(); const models=`${formatLocalizedNumber(modelCount,locale)} ${plural(locale,modelCount,{one:t("guides.count.modelOne"),few:t("guides.count.modelFew"),many:t("guides.count.modelMany")})}`; return <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between"><ProfileSectionHeader title={t("guides.page.title")} description={t("guides.page.description")}/><p className="shrink-0 text-sm text-[var(--text-secondary)]">{models} · {formatCount(locale, guideCount, "guide")}</p></div>; }
