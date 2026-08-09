"use client";

import { ImageIcon, Palette, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { ProfileBrandSettings } from "@/components/profile/ProfileBrandSettings";
import { ProfileAccountSettings } from "@/components/profile/ProfileAccountSettings";
import type { TranslationKey } from "@/features/i18n/locales/en";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export type SettingsTab = "account" | "brand" | "backgrounds";
type SettingsItem = { id: SettingsTab; icon: LucideIcon; labelKey: TranslationKey };

const SETTINGS_ITEMS: readonly SettingsItem[] = [
  { id: "account", icon: UserRound, labelKey: "settings.tabs.account" },
  { id: "brand", icon: Palette, labelKey: "settings.tabs.brand" },
  { id: "backgrounds", icon: ImageIcon, labelKey: "settings.tabs.backgrounds" },
];

export function SettingsPage({ activeTab }: { activeTab: SettingsTab }) {
  const { t } = useTranslation();
  return <div className="w-full">
    <header className="mb-6"><h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--text)]">{t("settings.title")}</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">{t("settings.description")}</p></header>
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <nav aria-label={t("settings.navigation")} className="flex shrink-0 gap-1 overflow-x-auto md:w-44 md:flex-col">
        {SETTINGS_ITEMS.map(({ id, icon: Icon, labelKey }) => { const active = id === activeTab; return <Link key={id} href={id === "account" ? "/settings" : `/settings?tab=${id}`} aria-current={active ? "page" : undefined} className={`flex min-h-10 shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}><Icon className="size-4" aria-hidden="true" />{t(labelKey)}</Link>; })}
      </nav>
      <main className="min-w-0 flex-1">
        {activeTab === "account" ? <ProfileAccountSettings /> : <ProfileBrandSettings section={activeTab} />}
      </main>
    </div>
  </div>;
}
