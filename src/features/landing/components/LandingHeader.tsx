import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
      <Container className="flex min-h-16 items-center justify-between gap-6 sm:min-h-[72px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-[var(--font-heading)] text-xl font-semibold"
          aria-label="Шар — головна"
        >
          <span
            className="grid size-9 place-items-center rounded-[10px] bg-[var(--accent)] text-sm font-semibold text-white"
            aria-hidden="true"
          >
            Ш
          </span>

          <span className="hidden min-[380px]:inline">Шар</span>
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm font-medium text-[var(--text-secondary)] md:flex"
          aria-label="Основна навігація"
        >
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[var(--text)]"
          >
            Як це працює
          </a>

          <a
            href="#guide-preview"
            className="transition-colors hover:text-[var(--text)]"
          >
            Приклад гайду
          </a>
        </nav>

        <div className="flex items-center gap-2.5">

          <ThemeToggle />
          
          <Link
            href="/login"
            className="hidden min-h-10 items-center justify-center rounded-[10px] border border-transparent px-4 text-sm font-medium transition-colors hover:border-[var(--border)] hover:bg-[var(--card)] sm:inline-flex"
          >
            Увійти
          </Link>

          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-[10px] bg-[var(--accent)] px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 sm:px-[18px] sm:text-sm"
          >
            <span className="sm:hidden">Спробувати</span>
            <span className="hidden sm:inline">Спробувати безкоштовно</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}