'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({
  className = '',
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);

  const isDark = mounted && resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        'inline-flex size-10 shrink-0 items-center justify-center',
        'rounded-[10px] border border-[var(--border)]',
        'bg-[var(--card)] text-[var(--text)]',
        'transition-colors hover:bg-[var(--surface)]',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[var(--bg)]',
        'motion-reduce:transition-none',
        className,
      ].join(' ')}
      aria-label={
        isDark
          ? t('theme.enableLight')
          : t('theme.enableDark')
      }
      title={
        isDark
          ? t('theme.enableLight')
          : t('theme.enableDark')
      }
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-[18px]" aria-hidden="true" />
        ) : (
          <Moon className="size-[18px]" aria-hidden="true" />
        )
      ) : (
        <span
          className="size-[18px] rounded-full border border-[var(--border-strong)]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
