"use client";

import type { User } from "firebase/auth";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { NavigationItem } from "./AppHeader";

export function MobileNavigation({ open, onClose, navigation, pathname, user, showRegistration }: { open: boolean; onClose: () => void; navigation: readonly NavigationItem[]; pathname: string; user: User | null; showRegistration: boolean }) {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); };
  }, [onClose, open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] bg-[var(--bg)] text-[var(--text)] md:hidden" role="dialog" aria-modal="true" aria-label={t("header.mobileMenu")}>
    <div className="flex min-h-16 items-center justify-between border-b border-[var(--border)] px-4"><span className="font-[family-name:var(--font-space-grotesk)] font-semibold">Model by Numbers</span><button ref={closeRef} type="button" onClick={onClose} aria-label={t("header.closeMenu")} className="grid size-10 place-items-center rounded-[10px] border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><X className="size-5"/></button></div>
    <nav aria-label={t("header.primaryNavigation")} className="flex flex-col gap-1 p-4">{navigation.map(item => { const active = item.id === "models" && pathname.startsWith("/models"); return <Link key={item.id} href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`rounded-xl px-4 py-3 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{t(item.labelKey)}</Link>; })}</nav>
    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-[var(--border)] p-4"><LanguageSwitcher/><ThemeToggle/>{user ? <SignOutButton/> : <><Link href="/login" onClick={onClose} className="inline-flex min-h-10 items-center rounded-[10px] px-3 text-sm font-medium text-[var(--text)]">{t("header.login")}</Link>{showRegistration?<Link href="/register" onClick={onClose} className="inline-flex min-h-10 items-center rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)]">{t("header.registration")}</Link>:null}</>}</div>
  </div>;
}
