import Link from 'next/link';

import { Container } from '@/components/ui/Container';

const navigation = [
  {
    label: 'Приклад гайду',
    href: '#guide-preview',
  },
  {
    label: 'Як це працює',
    href: '#how-it-works',
  },
  {
    label: 'Можливості',
    href: '#features',
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-8 sm:py-10">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[420px]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-lg font-semibold tracking-[-0.02em]"
              aria-label="Шар — головна сторінка"
            >
              <LogoMark />
              <span>Шар</span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              Платформа для створення покрокових гайдів із фарбування та
              складання 3D-друкованих моделей.
            </p>
          </div>

          <nav
            className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-7"
            aria-label="Навігація у футері"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
              >
                {item.label}
              </a>
            ))}

            <Link
              href="/login"
              className="font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
            >
              Увійти
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Шар. Усі права захищені.</p>

          <p className="font-[var(--font-mono)] tracking-[0.06em]">
            MADE FOR 3D CREATORS
          </p>
        </div>
      </Container>
    </footer>
  );
}

function LogoMark() {
  return (
    <span
      className="relative block h-9 w-9"
      aria-hidden="true"
    >
      <span className="absolute left-0 top-0 h-6 w-7 rounded-[8px] border border-[var(--accent)] bg-[var(--card)]" />
      <span className="absolute bottom-0 right-0 h-6 w-7 rounded-[8px] bg-[var(--accent)]" />
    </span>
  );
}