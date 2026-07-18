import { LoaderCircle } from "lucide-react";

type LoaderProps = {
  label?: string;
};

export function Loader({
  label = "Loading...",
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <LoaderCircle className="h-6 w-6 animate-spin text-[var(--accent)]" />

        <div
          aria-hidden="true"
          className="absolute -bottom-5 flex flex-col items-center gap-1"
        >
          <span className="h-1 w-10 rounded-full bg-[var(--accent)] opacity-30" />
          <span className="h-1 w-7 rounded-full bg-[var(--accent)] opacity-15" />
        </div>
      </div>

      <span className="mt-4 font-[family-name:var(--font-inter)] text-sm text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  );
}