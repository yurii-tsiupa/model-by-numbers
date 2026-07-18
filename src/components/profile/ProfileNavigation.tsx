"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { isProfileRouteActive, PROFILE_NAVIGATION } from "./profile-navigation";

export function ProfileNavigation() {
  const pathname = usePathname(); const { t } = useTranslation();
  return <><aside className="hidden w-52 shrink-0 border-r border-[var(--border)] p-4 md:block"><nav aria-label={t("profile.accessibility.navigation")} className="space-y-1">{PROFILE_NAVIGATION.map(item=>{const active=isProfileRouteActive(pathname,item);return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} className={`block rounded-[10px] px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active?"bg-[var(--card)] text-[var(--accent)]":"text-[var(--text-secondary)] hover:text-[var(--text)]"}`}>{t(item.labelKey)}</Link>})}</nav></aside><nav aria-label={t("profile.accessibility.mobileNavigation")} className="flex w-full gap-1 overflow-x-auto border-b border-[var(--border)] p-2 md:hidden">{PROFILE_NAVIGATION.map(item=>{const active=isProfileRouteActive(pathname,item);return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active?"bg-[var(--card)] text-[var(--accent)]":"text-[var(--text-secondary)]"}`}>{t(item.labelKey)}</Link>})}</nav></>;
}
