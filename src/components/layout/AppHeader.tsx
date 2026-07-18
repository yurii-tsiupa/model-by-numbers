"use client";

import { Box, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MobileNavigation } from "./MobileNavigation";

export type AppHeaderVariant = "public" | "application" | "editor" | "guide";
type NavigationItem = { id: "models" | "howItWorks" | "guidePreview"; href: string; labelKey: "header.nav.models" | "header.nav.howItWorks" | "header.nav.guidePreview" };
const PUBLIC_NAVIGATION: readonly NavigationItem[] = [{ id: "howItWorks", href: "/#how-it-works", labelKey: "header.nav.howItWorks" }, { id: "guidePreview", href: "/#guide-preview", labelKey: "header.nav.guidePreview" }];
const APPLICATION_NAVIGATION: readonly NavigationItem[] = [{ id: "models", href: "/models", labelKey: "header.nav.models" }];

export type AppHeaderProps = {
  variant: AppHeaderVariant;
  contextualStart?: ReactNode;
  contextualActions?: ReactNode;
  showNavigation?: boolean;
  className?: string;
};

export function AppHeader({ variant, contextualStart, contextualActions, showNavigation = true, className = "" }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = variant === "public" ? PUBLIC_NAVIGATION : APPLICATION_NAVIGATION;

  return <>
    <header data-platform-header className={`sticky top-0 z-50 shrink-0 border-b border-[var(--border)] bg-[var(--bg)] ${className}`}>
      <div className="flex min-h-16 w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        {contextualStart ?? <Link href={user ? "/models" : "/"} className="inline-flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-[var(--text)]" aria-label={t("header.homeLabel")}><span className="grid size-9 place-items-center rounded-[10px] border border-[var(--border)] bg-[var(--card)]" aria-hidden="true"><Box className="size-[18px] text-[var(--accent)]"/></span><span className="hidden sm:inline">Model by Numbers</span></Link>}

        {showNavigation ? <nav aria-label={t("header.primaryNavigation")} className="ml-4 hidden items-center gap-1 md:flex">{navigation.map(item => { const active = item.id === "models" && pathname.startsWith("/models"); return <Link key={item.id} href={item.href} aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text)]"}`}>{t(item.labelKey)}</Link>; })}</nav> : null}

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex"><LanguageSwitcher/><ThemeToggle/>{user ? <SignOutButton/> : <Link href="/login" className="inline-flex min-h-10 items-center rounded-[10px] bg-[var(--accent)] px-4 font-[family-name:var(--font-inter)] text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{t("header.login")}</Link>}</div>
          {contextualActions}
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:hidden" aria-label={t("header.openMenu")} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu className="size-5" aria-hidden="true"/></button>
        </div>
      </div>
    </header>
    <MobileNavigation open={mobileOpen} onClose={() => setMobileOpen(false)} navigation={showNavigation ? navigation : []} pathname={pathname} user={user}/>
  </>;
}

export type { NavigationItem };
