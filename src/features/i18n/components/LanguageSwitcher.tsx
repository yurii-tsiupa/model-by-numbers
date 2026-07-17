"use client";

import { useTranslation } from "../hooks/useTranslation";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="inline-flex items-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1"
    >
      {(["en", "uk"] as const).map((item) => {
        const active = locale === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            aria-pressed={active}
            className={[
              "flex h-8 min-w-10 items-center justify-center rounded-[8px] px-3",
              "text-xs font-medium transition-colors",
              active
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]",
            ].join(" ")}
          >
            {item.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}