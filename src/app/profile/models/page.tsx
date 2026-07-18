"use client";
import Link from "next/link";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
export default function ProfileModelsPage(){const{t}=useTranslation();return <><ProfileSectionHeader title={t("profile.models.title")} description={t("profile.models.description")}/><Link href="/models" className="mt-6 inline-flex min-h-10 items-center rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("profile.models.open")}</Link></>}
