"use client";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
export default function ProfileGuidesPage(){const{t}=useTranslation();return <ProfileSectionHeader title={t("profile.guides.title")} description={t("profile.guides.description")}/>}
