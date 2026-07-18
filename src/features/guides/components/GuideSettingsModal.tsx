"use client";

import { Check, FileText, X } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import type { GuideSettings } from "../types/ModelGuide";

type GuideSettingsModalProps = {
  initial: GuideSettings;
  canExplode: boolean;
  canAssemble: boolean;
  onClose: () => void;
  onConfirm: (settings: GuideSettings) => void;
};

type GuideSettingsOptionKey =
  | "includeExplodedView"
  | "includeAssemblyInstructions"
  | "includeAssemblyStepImages";

type SettingsOptionProps = {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function SettingsOption({
  label,
  checked,
  disabled,
  onChange,
}: SettingsOptionProps) {
  return (
    <label
      className={[
        "group flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-45"
          : "hover:bg-[var(--bg)]",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="peer sr-only"
      />

      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg)] transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--card)]">
        {checked ? (
          <Check
            className="h-3.5 w-3.5 text-white"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        ) : null}
      </span>

      <span className="text-sm font-medium text-[var(--text)]">
        {label}
      </span>
    </label>
  );
}

export function GuideSettingsModal({
  initial,
  canExplode,
  canAssemble,
  onClose,
  onConfirm,
}: GuideSettingsModalProps) {
  const { t } = useTranslation();

  const [settings, setSettings] =
    useState<GuideSettings>(initial);

  function updateOption(
    key: GuideSettingsOptionKey,
    checked: boolean,
  ) {
    setSettings((current) => ({
      ...current,
      [key]: checked,
      ...(key ===
        "includeAssemblyInstructions" &&
      !checked
        ? {
            includeAssemblyStepImages: false,
          }
        : {}),
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-settings-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-2xl shadow-black/20"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <FileText
                className="h-4 w-4 text-[var(--accent)]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
                Guide
              </p>

              <h2
                id="guide-settings-title"
                className="mt-1 font-[family-name:var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.025em] text-[var(--text)]"
              >
                {t("guide.settings.title")}
              </h2>
            </div>
          </div>

          <button
            type="button"
            aria-label={t("common.cancel")}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <X
              className="h-4 w-4"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="px-6 py-5">
          <div className="space-y-3">
            <SettingsOption
              label={t(
                "guide.settings.exploded",
              )}
              checked={
                settings.includeExplodedView
              }
              disabled={!canExplode}
              onChange={(checked) =>
                updateOption(
                  "includeExplodedView",
                  checked,
                )
              }
            />

            <SettingsOption
              label={t(
                "guide.settings.assembly",
              )}
              checked={
                settings.includeAssemblyInstructions
              }
              disabled={!canAssemble}
              onChange={(checked) =>
                updateOption(
                  "includeAssemblyInstructions",
                  checked,
                )
              }
            />

            <SettingsOption
              label={t(
                "guide.settings.assemblyImages",
              )}
              checked={
                settings.includeAssemblyStepImages
              }
              disabled={
                !canAssemble ||
                !settings.includeAssemblyInstructions
              }
              onChange={(checked) =>
                updateOption(
                  "includeAssemblyStepImages",
                  checked,
                )
              }
            />
          </div>

          {!canExplode ? (
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              {t(
                "guide.settings.explodedDisabled",
              )}
            </p>
          ) : null}

          {!canAssemble ? (
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              {t(
                "guide.settings.assemblyDisabled",
              )}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {t("common.cancel")}
          </button>

          <button
            type="button"
            onClick={() => onConfirm(settings)}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            {t("guide.settings.generate")}
          </button>
        </footer>
      </section>
    </div>
  );
}