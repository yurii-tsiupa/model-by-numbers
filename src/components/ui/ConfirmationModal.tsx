"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect } from "react";

type ConfirmationModalProps = {
  isOpen: boolean;

  title: string;
  description: string;

  confirmLabel?: string;
  cancelLabel?: string;

  variant?: "danger" | "warning";

  isLoading?: boolean;

  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
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
        className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl"
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
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex min-w-28 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${confirmButtonClassName}`}
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}