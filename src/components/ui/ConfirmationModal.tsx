"use client";

import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { suppressManualDetailPins } from "@/features/model-editor/store/viewerOverlayStore";

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
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    return suppressManualDetailPins();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      } else if (event.key === "Tab") {
        const items = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
        if (!items?.length) return;
        const first = items[0],last=items[items.length-1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }

    const previousOverflow = document.body.style.overflow;

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isLoading, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isDanger = variant === "danger";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:max-h-[calc(100dvh-2rem)]"
      >
        <button
          type="button"
          aria-label={t("common.close")}
          disabled={isLoading}
          onClick={onClose}
          className="absolute right-3 top-3 flex size-9 cursor-pointer items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--bg)] hover:text-[var(--text)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-4 pr-14 sm:p-5 sm:pr-16">
          <div className="flex items-start gap-3.5">
            <div
              className={`
                flex size-10 shrink-0 items-center justify-center
                rounded-lg border
                ${
                  isDanger
                    ? "border-red-500/25 bg-[color-mix(in_srgb,#ef4444_8%,var(--card))] text-red-500 dark:text-red-400"
                    : "border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))] text-[var(--accent)]"
                }
              `}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="min-w-0 pt-0.5">
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {isDanger ? t("common.danger") : t("common.confirmation")}
              </p>

              <h2
                id="confirmation-modal-title"
                className="mt-1 break-words font-[family-name:var(--font-space-grotesk)] text-lg font-semibold leading-6 text-[var(--text)]"
              >
                {title}
              </h2>

              <p
                id="confirmation-modal-description"
                className="mt-2 text-sm leading-5 text-[var(--text-secondary)]"
              >
                {description}
              </p>
            </div>
          </div>

          {children ? (
            <div className="mt-4 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3.5">
              {children}
            </div>
          ) : null}
        </div>

        <div className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_72%,var(--card))] px-4 py-3.5 sm:px-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="min-h-10 w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:bg-[var(--bg)] hover:text-[var(--text)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {cancelLabel ?? t("common.cancel")}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`
                flex w-full min-w-28 cursor-pointer items-center
                min-h-10 justify-center gap-2 rounded-lg px-4
                text-sm font-semibold text-[var(--accent-foreground)] transition
                active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2
                disabled:cursor-not-allowed disabled:opacity-50
                sm:w-auto
                ${
                  isDanger
                    ? "border border-red-500/35 bg-[color-mix(in_srgb,#dc2626_78%,var(--card))] hover:bg-[color-mix(in_srgb,#dc2626_88%,var(--card))] focus-visible:ring-red-500/40"
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
