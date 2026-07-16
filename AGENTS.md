# Model by Numbers contributor rules

## Internationalization

- English and Ukrainian are required for every user-facing string.
- Do not hardcode UI copy in components, including aria-labels, titles, tooltips, empty, loading, validation, and error states.
- Add every key to both `src/features/i18n/locales/en.ts` and `uk.ts`; English defines the compile-time key set.
- Use the shared Intl helpers for dates, numbers, relative time, and plural counts.
- Keep domain values such as `fdm`, `resin`, and reference types language-neutral and translate them at render time.
- Historical guide snapshots store their locale. Preview and PDF text must use the snapshot locale, not ambient UI state.
- Run TypeScript, lint, build, and a hardcoded JSX-string audit after UI changes.
