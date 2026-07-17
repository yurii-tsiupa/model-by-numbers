"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
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
  const {t}=useTranslation();
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isLoading, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const confirmButtonClassName =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-400"
      : "bg-orange-500 hover:bg-orange-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-3xl border border-white/10 bg-neutral-900 p-4 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              variant === "danger"
                ? "bg-red-500/10 text-red-400"
                : "bg-orange-500/10 text-orange-400"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold leading-7 text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              {description}
            </p>

            {children ? (
              <div className="mt-5 min-w-0">{children}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium leading-5 text-neutral-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-50 sm:w-auto"
          >
            {cancelLabel??t("common.cancel")}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex w-full min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium leading-5 text-white transition disabled:opacity-50 sm:w-auto sm:min-w-28 ${confirmButtonClassName}`}
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {t("common.processing")}
              </>
            ) : (
              confirmLabel??t("common.confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
