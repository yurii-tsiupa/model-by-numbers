"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState, type FormEvent } from "react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getDisplayNameInitial } from "@/features/auth/lib/displayName";
import { normalizeDisplayName } from "@/features/auth/lib/displayName";
import { validateDisplayName } from "@/features/auth/services/auth-validation";
import { normalizeProfileUpdateError } from "@/features/auth/services/profile-errors";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function ProfileAccountSettings() {
  const { user, displayName, updateDisplayName } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState(displayName);
  const [syncedDisplayName, setSyncedDisplayName] = useState(displayName);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [saving, setSaving] = useState(false);

  if (displayName !== syncedDisplayName) {
    setSyncedDisplayName(displayName);
    setName(displayName);
  }
  if (!user) return null;

  const visibleName = displayName || t("profile.overview.missingName");
  const initial = getDisplayNameInitial(displayName);
  const provider = user.providerData.some((item) => item.providerId === "google.com")
    ? t("profile.providers.google")
    : t("profile.providers.password");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validation = validateDisplayName(name);
    if (validation) { setError(t(`auth.validation.${validation}`)); return; }
    const normalizedName = normalizeDisplayName(name);
    setSaving(true); setError(undefined); setMessage(undefined);
    try {
      await updateDisplayName(normalizedName);
      setName(normalizedName);
      setMessage(t("profile.success.saved"));
    } catch (runtimeError) {
      setError(t(`profile.errors.${normalizeProfileUpdateError(runtimeError)}`));
    } finally { setSaving(false); }
  }

  const errorId = error ? "account-display-name-error" : undefined;
  return <section className="max-w-[620px]" aria-labelledby="settings-account-title">
    <h2 id="settings-account-title" className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text)]">{t("profile.account.title")}</h2>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("profile.account.description")}</p>
    <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex min-w-0 items-center gap-4 border-b border-[var(--border)] pb-5">
        {user.photoURL ? <Image unoptimized src={user.photoURL} alt="" width={56} height={56} className="size-14 rounded-full object-cover" referrerPolicy="no-referrer" /> : <span aria-label={t("profile.accessibility.avatarFallback", { displayName: visibleName })} className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-lg font-semibold text-[var(--accent-foreground)]">{initial ?? <UserRound aria-hidden="true" className="size-6" />}</span>}
        <div className="min-w-0"><p className="truncate text-base font-semibold">{visibleName}</p><p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{user.email}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{t("profile.overview.signedInWith", { provider })}</p></div>
      </div>
      <form aria-label={t("profile.accessibility.accountForm")} onSubmit={submit} noValidate className="mt-5 space-y-4">
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <label htmlFor="account-display-name" className="block text-sm font-medium">{t("profile.account.identity.displayName")}<input id="account-display-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={Boolean(error)} aria-describedby={errorId} placeholder={t("profile.account.identity.addName")} className="mt-2 h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />{error ? <span id={errorId} role="alert" className="mt-1.5 block text-xs text-[var(--danger)]">{error}</span> : null}</label>
          <div><p className="text-sm font-medium">{t("profile.account.identity.method")}</p><p className="mt-2 flex h-11 items-center rounded-[10px] bg-[var(--surface)] px-3 text-sm text-[var(--text-secondary)]">{provider}</p></div>
        </div>
        <label htmlFor="account-email" className="block text-sm font-medium">{t("profile.account.identity.email")}<input id="account-email" value={user.email ?? ""} readOnly aria-describedby="account-email-help" className="mt-2 h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text-secondary)]" /><span id="account-email-help" className="mt-1.5 block text-xs text-[var(--text-secondary)]">{t("profile.account.identity.emailReadonly")}</span></label>
        {message ? <p role="status" className="text-sm text-[var(--accent-2)]">{message}</p> : null}
        <button type="submit" disabled={saving} className="min-h-11 cursor-pointer rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50">{saving ? t("profile.account.identity.saving") : t("profile.account.identity.save")}</button>
      </form>
      <div className="mt-6 border-t border-[var(--border)] pt-3"><SignOutButton /></div>
    </div>
  </section>;
}
