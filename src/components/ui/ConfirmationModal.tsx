"use client";

import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  useEffect,
  type ReactNode,
} from "react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "warning",
  isLoading = false,
  children,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isDanger = variant === "danger";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isLoading
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      >
        <button
          type="button"
          aria-label={t("common.close")}
          disabled={isLoading}
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 pr-16 sm:p-6 sm:pr-16">
          <div className="flex items-start gap-4">
            <div
              className={`
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-xl border
                ${
                  isDanger
                    ? "border-red-500/25 bg-red-500/8 text-red-500"
                    : "border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))] text-[var(--accent)]"
                }
              `}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="min-w-0 pt-0.5">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {isDanger ? "Danger" : "Confirmation"}
              </p>

              <h2
                id="confirmation-modal-title"
                className="mt-1 break-words font-[var(--font-space-grotesk)] text-lg font-semibold leading-7 text-[var(--text)]"
              >
                {title}
              </h2>

              <p
                id="confirmation-modal-description"
                className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"
              >
                {description}
              </p>
            </div>
          </div>

          {children ? (
            <div className="mt-5 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
              {children}
            </div>
          ) : null}
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="w-full cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {cancelLabel ?? t("common.cancel")}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`
                flex w-full min-w-28 cursor-pointer items-center
                justify-center gap-2 rounded-xl px-4 py-2.5
                text-sm font-semibold text-white transition
                focus-visible:outline-none focus-visible:ring-2
                disabled:cursor-not-allowed disabled:opacity-50
                sm:w-auto
                ${
                  isDanger
                    ? "bg-red-500 hover:bg-red-600 focus-visible:ring-red-500/30"
                    : "bg-[var(--accent)] hover:opacity-90 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
                }
              `}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {t("common.processing")}
                </>
              ) : (
                confirmLabel ?? t("common.confirm")
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}