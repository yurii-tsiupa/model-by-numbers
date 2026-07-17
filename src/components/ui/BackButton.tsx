"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  label: string;
};

export function BackButton({ label }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] px-5 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}