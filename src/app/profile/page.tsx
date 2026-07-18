"use client";

import Image from "next/image";
import Link from "next/link";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { PROFILE_NAVIGATION } from "@/components/profile/profile-navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function ProfileOverviewPage() {
  const { user } = useAuth(); const { t } = useTranslation(); if (!user) return null;
  const name = user.displayName?.trim() || t("profile.overview.missingName"); const provider = user.providerData.some(item => item.providerId === "google.com") ? t("profile.providers.google") : t("profile.providers.password");
  return <><ProfileSectionHeader title={t("profile.overview.title")} description={t("profile.overview.description")}/><section className="mt-6 max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex min-w-0 items-center gap-4">{user.photoURL ? <Image unoptimized src={user.photoURL} alt="" width={56} height={56} className="size-14 rounded-full object-cover" referrerPolicy="no-referrer"/> : <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-lg font-semibold text-[var(--accent-foreground)]">{(user.displayName || user.email || "?").charAt(0).toUpperCase()}</span>}<div className="min-w-0"><h2 className="truncate text-base font-semibold">{name}</h2>{user.email ? <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{user.email}</p> : null}<p className="mt-1 text-xs text-[var(--text-secondary)]">{t("profile.overview.signedInWith", { provider })}</p></div></div></section><nav aria-label={t("profile.accessibility.sectionLinks")} className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{PROFILE_NAVIGATION.filter(item => !item.exact).map(item => <Link key={item.href} href={item.href} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-medium text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t(item.labelKey)}</Link>)}</nav></>;
}
