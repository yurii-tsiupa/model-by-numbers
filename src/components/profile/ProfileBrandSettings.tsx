"use client";

import { Check, ChevronDown, ChevronUp, ImagePlus, Pencil, Star, Trash2, X } from "lucide-react";
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

export function ProfileBrandSettings({ section = "brand" }: { section?: "brand" | "backgrounds" }) {
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
  const [editingBackgroundId, setEditingBackgroundId] = useState<string | null>(null);
  const [backgroundNameDraft, setBackgroundNameDraft] = useState("");
  const [backgroundBusy, setBackgroundBusy] = useState(false);
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
      await updateBrandAssets({ ...currentProfile.brandAssets, backgrounds: [...currentProfile.brandAssets.backgrounds, { id, localAssetId, name }] });
      setBackgroundName(""); setError(null);
    } catch { if (localAssetId) await deleteUserBrandBackground(localAssetId).catch(() => undefined); setError(t("profile.brand.backgrounds.saveError")); }
  }

  async function removeBackground(id: string) {
    const asset = currentProfile.brandAssets.backgrounds.find((item) => item.id === id);
    if (!asset) return;
    try { setBackgroundBusy(true); await updateBrandAssets({ backgrounds: currentProfile.brandAssets.backgrounds.filter((item) => item.id !== id), defaultBackgroundId: currentProfile.brandAssets.defaultBackgroundId === id ? null : currentProfile.brandAssets.defaultBackgroundId }); }
    catch { setError(t("profile.brand.backgrounds.saveError")); }
    finally { setBackgroundBusy(false); }
  }

  async function renameBackground(id: string) {
    const name = backgroundNameDraft.trim().slice(0, 80) || null;
    try { setBackgroundBusy(true); await updateBrandAssets({ ...currentProfile.brandAssets, backgrounds: currentProfile.brandAssets.backgrounds.map((item) => item.id === id ? { ...item, name } : item) }); setEditingBackgroundId(null); }
    catch { setError(t("profile.brand.backgrounds.saveError")); }
    finally { setBackgroundBusy(false); }
  }

  async function moveBackground(id: string, direction: -1 | 1) {
    const backgrounds = [...currentProfile.brandAssets.backgrounds];
    const index = backgrounds.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= backgrounds.length) return;
    [backgrounds[index], backgrounds[nextIndex]] = [backgrounds[nextIndex], backgrounds[index]];
    try { setBackgroundBusy(true); await updateBrandAssets({ ...currentProfile.brandAssets, backgrounds }); }
    catch { setError(t("profile.brand.backgrounds.saveError")); }
    finally { setBackgroundBusy(false); }
  }

  async function setDefaultBackground(id: string) {
    try { setBackgroundBusy(true); await updateBrandAssets({ ...currentProfile.brandAssets, defaultBackgroundId: currentProfile.brandAssets.defaultBackgroundId === id ? null : id }); }
    catch { setError(t("profile.brand.backgrounds.saveError")); }
    finally { setBackgroundBusy(false); }
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
  return <section aria-labelledby="profile-brand-title" className="w-full">
      <h2 id="profile-brand-title" className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text)]">{t(section === "brand" ? "profile.brand.title" : "profile.brand.backgrounds.title")}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{t(section === "brand" ? "profile.brand.description" : "settings.backgrounds.description")}</p>
      {section === "brand" ? <form onSubmit={submit} noValidate className="mt-5 max-w-[700px] space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
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
      </form> : null}
      {section === "backgrounds" ? <div className="mt-5 max-w-[700px] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex gap-2"><input value={backgroundName} maxLength={80} onChange={(event) => setBackgroundName(event.target.value)} placeholder={t("profile.brand.backgrounds.name")} className="h-9 min-w-0 flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" /><button type="button" onClick={() => backgroundInputRef.current?.click()} className="h-9 shrink-0 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)]">{t("profile.brand.backgrounds.add")}</button><input ref={backgroundInputRef} hidden type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadBackground(file); }} /></div>
        {backgrounds.length ? <div className="mt-3 space-y-1.5">{backgrounds.map((background, index) => { const isDefault = currentProfile.brandAssets.defaultBackgroundId === background.id; const isEditing = editingBackgroundId === background.id; return <div key={background.id} className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1.5"><Image unoptimized src={background.imageUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-md object-cover" />{isEditing ? <input autoFocus value={backgroundNameDraft} maxLength={80} aria-label={t("profile.brand.backgrounds.name")} onChange={(event) => setBackgroundNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void renameBackground(background.id); } if (event.key === "Escape") { event.preventDefault(); setEditingBackgroundId(null); } }} className="h-8 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" /> : <p title={background.name ?? ""} className="min-w-0 flex-1 truncate text-xs text-[var(--text)]">{background.name || t("profile.brand.backgrounds.unnamed")}</p>}<div className="flex shrink-0 items-center gap-0.5">{isEditing ? <><button type="button" title={t("profile.brand.backgrounds.renameSave")} aria-label={t("profile.brand.backgrounds.renameSave")} disabled={backgroundBusy} onClick={() => void renameBackground(background.id)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--accent)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"><Check className="size-3.5" /></button><button type="button" title={t("profile.brand.backgrounds.renameCancel")} aria-label={t("profile.brand.backgrounds.renameCancel")} disabled={backgroundBusy} onClick={() => setEditingBackgroundId(null)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"><X className="size-3.5" /></button></> : <button type="button" title={t("profile.brand.backgrounds.rename")} aria-label={t("profile.brand.backgrounds.rename")} disabled={backgroundBusy} onClick={() => { setEditingBackgroundId(background.id); setBackgroundNameDraft(background.name ?? ""); }} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"><Pencil className="size-3.5" /></button>}<button type="button" title={t("profile.brand.backgrounds.moveUp")} aria-label={t("profile.brand.backgrounds.moveUp")} disabled={backgroundBusy || index === 0} onClick={() => void moveBackground(background.id, -1)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-35"><ChevronUp className="size-3.5" /></button><button type="button" title={t("profile.brand.backgrounds.moveDown")} aria-label={t("profile.brand.backgrounds.moveDown")} disabled={backgroundBusy || index === backgrounds.length - 1} onClick={() => void moveBackground(background.id, 1)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-35"><ChevronDown className="size-3.5" /></button><button type="button" title={t(isDefault ? "profile.brand.backgrounds.clearDefault" : "profile.brand.backgrounds.setDefault")} aria-label={t(isDefault ? "profile.brand.backgrounds.clearDefault" : "profile.brand.backgrounds.setDefault")} aria-pressed={isDefault} disabled={backgroundBusy} onClick={() => void setDefaultBackground(background.id)} className={`grid size-7 cursor-pointer place-items-center rounded-md hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50 ${isDefault ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}><Star className="size-3.5" fill={isDefault ? "currentColor" : "none"} /></button><button type="button" title={t("profile.brand.remove")} aria-label={t("profile.brand.remove")} disabled={backgroundBusy} onClick={() => void removeBackground(background.id)} className="grid size-7 cursor-pointer place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="size-3.5" /></button></div></div>; })}</div> : <p className="mt-3 text-xs text-[var(--text-secondary)]">{t("profile.brand.backgrounds.empty")}</p>}
      </div> : null}
    </section>;
}
