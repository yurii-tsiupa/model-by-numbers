"use client";

import { ChevronDown, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { SignOutButton } from "./SignOutButton";

export function UserMenu() {
  const { user } = useAuth(); const { t } = useTranslation(); const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; const key = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("mousedown", close); document.addEventListener("keydown", key); return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", key); }; }, [open]);
  if (!user) return null;
  const name = user.displayName?.trim() || t("profile.overview.missingName"); const initial = (user.displayName?.trim() || user.email || "?").charAt(0).toUpperCase();
  const linkClass = "block rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
  return <div ref={root} className="relative"><button type="button" aria-label={t("profile.userMenu.open")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex min-h-10 items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{user.photoURL ? <Image unoptimized src={user.photoURL} alt="" width={28} height={28} className="size-7 rounded-full object-cover" referrerPolicy="no-referrer"/> : <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--accent-foreground)]">{initial}</span>}<span className="hidden max-w-32 truncate lg:inline">{name}</span><ChevronDown className="size-4 text-[var(--text-secondary)]" aria-hidden="true"/></button>{open ? <div role="menu" aria-label={t("profile.userMenu.label")} className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2"><Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className={`flex ${linkClass}`}><UserRound className="mr-2 size-4"/>{t("profile.userMenu.profile")}</Link><Link role="menuitem" href="/profile/account" onClick={() => setOpen(false)} className={linkClass}>{t("profile.userMenu.account")}</Link><div className="mt-1 border-t border-[var(--border)] pt-1"><SignOutButton/></div></div> : null}</div>;
}
