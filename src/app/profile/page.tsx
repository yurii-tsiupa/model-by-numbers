"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { ProfileBrandSettings } from "@/components/profile/ProfileBrandSettings";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getDisplayNameInitial } from "@/features/auth/lib/displayName";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function ProfileOverviewPage() {
  const { user, displayName } = useAuth();
  const { t } = useTranslation();
  if (!user) return null;

  const name = displayName || t("profile.overview.missingName");
  const initial = getDisplayNameInitial(displayName);
  const provider = user.providerData.some((item) => item.providerId === "google.com") ? t("profile.providers.google") : t("profile.providers.password");

  return <><ProfileSectionHeader title={t("profile.overview.title")} description={t("profile.overview.description")}/><section className="mt-6 max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex min-w-0 items-center gap-4">{user.photoURL ? <Image unoptimized src={user.photoURL} alt="" width={56} height={56} className="size-14 rounded-full object-cover" referrerPolicy="no-referrer"/> : <span aria-label={t("profile.accessibility.avatarFallback", { displayName: name })} className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-lg font-semibold text-[var(--accent-foreground)]">{initial ?? <UserRound aria-hidden="true" className="size-6" />}</span>}<div className="min-w-0 flex-1"><h2 className="truncate text-base font-semibold">{name}</h2>{user.email ? <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{user.email}</p> : null}<p className="mt-1 text-xs text-[var(--text-secondary)]">{t("profile.overview.signedInWith", { provider })}</p></div><Link href="/profile/account" className="shrink-0 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("profile.userMenu.account")}</Link></div></section><ProfileBrandSettings /></>;
}
