"use client";

import { Box } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

const APP_LINKS = [
  { href: "/models", labelKey: "header.nav.models" },
  { href: "/guides", labelKey: "header.nav.guides" },
  { href: "/templates", labelKey: "header.nav.templates" },
] as const;

const PUBLIC_LINKS = [
  { href: "/#guide-preview", labelKey: "landing.footer.guidePreview" },
  { href: "/#how-it-works", labelKey: "landing.footer.howItWorks" },
  { href: "/#features", labelKey: "landing.footer.features" },
  { href: "/#feedback", labelKey: "landing.footer.feedback" },
] as const;

export function AppFooter() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const links = user ? APP_LINKS : PUBLIC_LINKS;
  const showLogin = !isLoading && !user && pathname !== "/login";

  return (
    <footer data-global-footer className="shrink-0 border-t border-[var(--border)] bg-[var(--card)] py-6 text-[var(--text)] print:hidden">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <Link
              href="/"
              aria-label={t("landing.accessibility.home")}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-md font-[family-name:var(--font-display)] text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <span className="grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)]" aria-hidden="true">
                <Box className="size-4 text-[var(--accent)]" />
              </span>
              Model by Numbers
            </Link>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {t("landing.footer.description")}
            </p>
          </div>

          <nav
            aria-label={t("landing.accessibility.footerNavigation")}
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
          >
            {!isLoading ? (
              <>
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="cursor-pointer rounded text-[var(--text-secondary)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
                {showLogin ? (
                  <Link
                    href="/login"
                    className="cursor-pointer rounded font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    {t("header.login")}
                  </Link>
                ) : null}
              </>
            ) : null}
          </nav>
        </div>

        <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-secondary)]">
          {t("landing.footer.copyright", { year })}
        </p>
      </Container>
    </footer>
  );
}
