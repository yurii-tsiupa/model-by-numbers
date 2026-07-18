"use client";

import { ProtectedAppShell } from "@/components/layout/ProtectedAppShell";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function GuidesPage() { const { t } = useTranslation(); return <ProtectedAppShell><ProfileSectionHeader title={t("workspace.guides.title")} description={t("workspace.guides.description")}/></ProtectedAppShell>; }
