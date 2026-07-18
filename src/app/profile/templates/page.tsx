"use client";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
export default function ProfileTemplatesPage(){const{t}=useTranslation();return <ProfileSectionHeader title={t("profile.templates.title")} description={t("profile.templates.description")}/>}
