"use client";

import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { deleteUserBrandLogo, loadUserBrandLogo, saveUserBrandLogo } from "@/features/auth/services/userBrandLogoStorage";
import { deleteUserBrandBackground, saveUserBrandBackground } from "@/features/auth/services/userBrandBackgroundStorage";
import { useUserBrandBackgroundAssets } from "@/features/auth/hooks/useUserBrandBackgroundAssets";
import { EMPTY_USER_BRAND_DEFAULTS, type UserBrandDefaults } from "@/features/auth/types/UserBrandDefaults";
import { normalizeGuideAccentColor } from "@/features/guides/design/guideDesignTokens";
import { GuideBrandSocialLinksEditor } from "@/features/guides/components/GuidePdfDesignPanel";
import { normalizeGuideBrandUrl } from "@/features/guides/types/GuideBrandSettings";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export function ProfileBrandSettings() {
  const { profile, updateBrandAssets, updateBrandDefaults, user } = useAuth();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<UserBrandDefaults>(profile?.brandDefaults ?? EMPTY_USER_BRAND_DEFAULTS);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [backgroundName, setBackgroundName] = useState("");
  const backgrounds = useUserBrandBackgroundAssets(profile?.brandAssets.backgrounds ?? []);

  if (profile !== draftProfile) {
    setDraftProfile(profile);
    if (profile) setDraft(profile.brandDefaults);
  }
  useEffect(() => {
    let active = true;
    let runtimeUrl: string | null = null;
    async function resolveLogo() {
      const blob = logoFile ?? (!removeLogo && draft.logoAssetId ? await loadUserBrandLogo(draft.logoAssetId) : null);
      if (!active || !blob) { if (active) setLogoUrl(null); return; }
      runtimeUrl = URL.createObjectURL(blob); setLogoUrl(runtimeUrl);
    }
    void resolveLogo();
    return () => { active = false; if (runtimeUrl) URL.revokeObjectURL(runtimeUrl); };
  }, [draft.logoAssetId, logoFile, removeLogo]);

  if (!user || !profile) return null;
  const currentUser = user;
  const currentProfile = profile;

  function cancel() { setDraft(currentProfile.brandDefaults); setLogoFile(null); setRemoveLogo(false); setError(null); setMessage(null); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setMessage(null);
    const websiteUrl = draft.websiteUrl ? normalizeGuideBrandUrl(draft.websiteUrl) : null;
    const contactEmail = draft.contactEmail?.trim() || null;
    if (draft.websiteUrl && !websiteUrl) { setError(t("profile.brand.errors.invalidWebsite")); return; }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) { setError(t("profile.brand.errors.invalidEmail")); return; }
    const accentColor = draft.accentColor ? normalizeGuideAccentColor(draft.accentColor) : null;
    if (draft.accentColor && !accentColor) { setError(t("profile.brand.errors.invalidAccent")); return; }
    setSaving(true);
    try {
      const previousAssetId = currentProfile.brandDefaults.logoAssetId;
      const logoAssetId = logoFile ? await saveUserBrandLogo(currentUser.uid, logoFile) : removeLogo ? null : draft.logoAssetId;
      const next = { ...draft, name: draft.name?.trim().slice(0, 100) || null, websiteUrl, contactEmail, accentColor, logoAssetId, socialLinks: draft.socialLinks.map((link) => ({ ...link })) };
      await updateBrandDefaults(next);
      if (removeLogo && previousAssetId) await deleteUserBrandLogo(previousAssetId);
      setDraft(next); setLogoFile(null); setRemoveLogo(false); setMessage(t("profile.brand.saved"));
    } catch { setError(t("profile.brand.errors.save")); } finally { setSaving(false); }
  }

  async function uploadBackground(file: File) {
    if (!file.size || file.size > 2 * 1024 * 1024 || !["image/png", "image/jpeg"].includes(file.type)) { setError(t("profile.brand.backgrounds.invalid")); return; }
    const id = crypto.randomUUID();
    let localAssetId: string | null = null;
    try {
      localAssetId = await saveUserBrandBackground(currentUser.uid, id, file);
      const name = backgroundName.trim().slice(0, 80) || file.name.replace(/\.[^.]+$/, "").slice(0, 80) || null;
      await updateBrandAssets({ backgrounds: [...currentProfile.brandAssets.backgrounds, { id, localAssetId, name }] });
      setBackgroundName(""); setError(null);
    } catch { if (localAssetId) await deleteUserBrandBackground(localAssetId).catch(() => undefined); setError(t("profile.brand.backgrounds.saveError")); }
  }

  async function removeBackground(id: string) {
    const asset = currentProfile.brandAssets.backgrounds.find((item) => item.id === id);
    if (!asset) return;
    try { await updateBrandAssets({ backgrounds: currentProfile.brandAssets.backgrounds.filter((item) => item.id !== id) }); await deleteUserBrandBackground(asset.localAssetId); }
    catch { setError(t("profile.brand.backgrounds.saveError")); }
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
  return <section aria-labelledby="profile-brand-title" className="mt-6 max-w-2xl border-t border-[var(--border)] pt-6">
      <h2 id="profile-brand-title" className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text)]">{t("profile.brand.title")}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("profile.brand.description")}</p>
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="relative size-16 shrink-0">
            {logoUrl ? <>
              {/* eslint-disable-next-line @next/next/no-img-element -- local IndexedDB asset URL cannot use the image optimizer. */}
              <img src={logoUrl} alt="" className="size-16 rounded-xl border border-[var(--border)] bg-[var(--card)] object-contain p-1" />
              <button type="button" aria-label={t("profile.brand.replaceLogo")} title={t("profile.brand.replaceLogo")} onClick={() => logoInputRef.current?.click()} className="absolute -bottom-1 -right-1 grid size-7 cursor-pointer place-items-center rounded-full border border-[var(--border)] bg-[var(--card)]"><Pencil className="size-3.5" /></button><button type="button" aria-label={t("profile.brand.remove")} title={t("profile.brand.remove")} onClick={() => { setLogoFile(null); setRemoveLogo(true); }} className="absolute -right-1 -top-1 grid size-6 cursor-pointer place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)]"><Trash2 className="size-3" /></button>
            </> : <button type="button" aria-label={t("profile.brand.uploadLogo")} title={t("profile.brand.uploadLogo")} onClick={() => logoInputRef.current?.click()} className="grid size-16 cursor-pointer place-items-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--card)] text-[var(--text-secondary)]"><ImagePlus className="size-5" /></button>}
            <input ref={logoInputRef} hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (!file.size || !["image/png", "image/jpeg"].includes(file.type)) { setError(t("profile.brand.errors.logoUnsupported")); return; } if (file.size > 512 * 1024) { setError(t("profile.brand.errors.logoTooLarge")); return; } setError(null); setLogoFile(file); setRemoveLogo(false); }} />
          </div>
          <label className="min-w-0 flex-1 text-sm font-medium">{t("profile.brand.name")}<input value={draft.name ?? ""} maxLength={100} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClass} /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">{t("profile.brand.website")}<input type="url" value={draft.websiteUrl ?? ""} onChange={(event) => setDraft({ ...draft, websiteUrl: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium">{t("profile.brand.contact")}<input type="email" value={draft.contactEmail ?? ""} onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })} className={inputClass} /></label>
        </div>
        <GuideBrandSocialLinksEditor disabled={saving} links={draft.socialLinks} onChange={(socialLinks) => setDraft({ ...draft, socialLinks })} t={t} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">{t("profile.brand.accent")}<span className="mt-1.5 flex h-10 items-center gap-3"><input type="color" value={draft.accentColor ?? "#7C3AED"} onChange={(event) => setDraft({ ...draft, accentColor: event.target.value })} className="size-8 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="font-[family-name:var(--font-mono)] text-xs">{draft.accentColor ?? "#7C3AED"}</span></span></label>
          <label className="text-sm font-medium">{t("profile.brand.defaultLocale")}<select value={draft.defaultGuideLocale} onChange={(event) => setDraft({ ...draft, defaultGuideLocale: event.target.value === "uk" ? "uk" : "en" })} className={`${inputClass} cursor-pointer`}><option value="en">{t("language.en")}</option><option value="uk">{t("language.uk")}</option></select></label>
        </div>
        {error ? <p role="alert" className="text-sm text-[var(--danger)]">{error}</p> : null}{message ? <p role="status" className="text-sm text-[var(--accent-2)]">{message}</p> : null}
        <div className="flex gap-2"><button type="submit" disabled={saving} className="min-h-10 cursor-pointer rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-60">{saving ? t("profile.brand.saving") : t("profile.brand.save")}</button><button type="button" disabled={saving} onClick={cancel} className="min-h-10 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60">{t("profile.brand.cancel")}</button></div>
      </form>
      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <h3 className="text-sm font-semibold text-[var(--text)]">{t("profile.brand.backgrounds.title")}</h3>
        <div className="mt-3 flex gap-2"><input value={backgroundName} maxLength={80} onChange={(event) => setBackgroundName(event.target.value)} placeholder={t("profile.brand.backgrounds.name")} className="h-9 min-w-0 flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" /><button type="button" onClick={() => backgroundInputRef.current?.click()} className="h-9 shrink-0 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)]">{t("profile.brand.backgrounds.add")}</button><input ref={backgroundInputRef} hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadBackground(file); }} /></div>
        {backgrounds.length ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{backgrounds.map((background) => <div key={background.id} className="group relative min-w-0"><div className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]"><Image unoptimized src={background.imageUrl} alt="" width={160} height={160} className="size-full object-cover" /></div><p title={background.name ?? ""} className="mt-1 truncate text-[10px] text-[var(--text-secondary)]">{background.name}</p><button type="button" title={t("profile.brand.remove")} aria-label={t("profile.brand.remove")} onClick={() => void removeBackground(background.id)} className="absolute -right-1 -top-1 grid size-6 cursor-pointer place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] opacity-0 shadow-sm focus:opacity-100 group-hover:opacity-100"><Trash2 className="size-3" /></button></div>)}</div> : <p className="mt-3 text-xs text-[var(--text-secondary)]">{t("profile.brand.backgrounds.empty")}</p>}
      </div>
      </div>
    </section>;
}
