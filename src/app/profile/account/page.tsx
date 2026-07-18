"use client";

import { useState, type FormEvent } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { normalizeDisplayName } from "@/features/auth/lib/displayName";
import { validateDisplayName } from "@/features/auth/services/auth-validation";
import { normalizeProfileUpdateError } from "@/features/auth/services/profile-errors";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function ProfileAccountPage() {
  const { user, displayName, updateDisplayName } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState(displayName);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const provider = user.providerData.some((item) => item.providerId === "google.com")
    ? t("profile.providers.google")
    : t("profile.providers.password");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validation = validateDisplayName(name);
    if (validation) {
      setError(t(`auth.validation.${validation}`));
      return;
    }

    const normalizedName = normalizeDisplayName(name);
    setSaving(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await updateDisplayName(normalizedName);
      setName(normalizedName);
      setMessage(t("profile.success.saved"));
    } catch (runtimeError) {
      setError(t(`profile.errors.${normalizeProfileUpdateError(runtimeError)}`));
    } finally {
      setSaving(false);
    }
  }

  const errorId = error ? "account-display-name-error" : undefined;

  return (
    <>
      <ProfileSectionHeader title={t("profile.account.title")} description={t("profile.account.description")} />
      <section className="mt-6 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">{t("profile.account.identity.title")}</h2>
        <form aria-label={t("profile.accessibility.accountForm")} onSubmit={submit} noValidate className="mt-5 space-y-4">
          <label htmlFor="account-display-name" className="block text-sm font-medium">
            {t("profile.account.identity.displayName")}
            <input id="account-display-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={Boolean(error)} aria-describedby={errorId} placeholder={t("profile.account.identity.addName")} className="mt-2 h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
            {error ? <span id={errorId} role="alert" className="mt-1.5 block text-xs text-[var(--accent)]">{error}</span> : null}
          </label>
          <label htmlFor="account-email" className="block text-sm font-medium">
            {t("profile.account.identity.email")}
            <input id="account-email" value={user.email ?? ""} readOnly aria-describedby="account-email-help" className="mt-2 h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-secondary)]" />
            <span id="account-email-help" className="mt-1.5 block text-xs text-[var(--text-secondary)]">{t("profile.account.identity.emailReadonly")}</span>
          </label>
          <div>
            <p className="text-sm font-medium">{t("profile.account.identity.method")}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{provider}</p>
          </div>
          {message ? <p role="status" className="text-sm text-[var(--accent-2)]">{message}</p> : null}
          <button type="submit" disabled={saving} className="min-h-11 w-full rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-50 sm:w-auto">
            {saving ? t("profile.account.identity.saving") : t("profile.account.identity.save")}
          </button>
        </form>
        <div className="mt-6 border-t border-[var(--border)] pt-3"><SignOutButton /></div>
      </section>
    </>
  );
}
