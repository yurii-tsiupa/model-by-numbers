import { ArrowLeft, Layers3 } from "lucide-react";
import Link from "next/link";

import type { GuideReadiness } from "@/features/model-editor/types/GuideReadiness";

type GuideNotReadyStateProps = {
  projectId: string;
  readiness: GuideReadiness;
};

export function GuideNotReadyState({
  projectId,
  readiness,
}: GuideNotReadyStateProps) {
  const incompleteChecks = readiness.checks.filter(
    (check) => !check.isComplete,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-12 text-[var(--text)]">
      <section className="w-full max-w-3xl rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <span className="absolute bottom-0 h-9 w-10 rounded-xl border border-[var(--border)] bg-[var(--bg)]" />
            <span className="absolute bottom-2 h-9 w-10 rounded-xl border border-[var(--border)] bg-[var(--bg)]" />
            <span className="absolute bottom-4 h-9 w-10 rounded-xl border border-[color:var(--accent)] bg-[var(--card)]" />

            <Layers3
              className="relative z-10 h-5 w-5 text-[var(--accent)]"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Guide Status
            </p>

            <h1 className="mt-1 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Finish preparing this guide
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              A few required steps are still missing. Complete them in the
              editor and the painting guide will become available.
            </p>
          </div>
        </div>

        <div className="my-8 h-px bg-[var(--border)]" />

        <div className="space-y-3">
          {incompleteChecks.map((check, index) => (
            <div
              key={check.id}
              className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] font-mono text-xs font-semibold text-[var(--accent)]">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="min-w-0">
                <h2 className="font-medium text-[var(--text)]">
                  {check.label}
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {check.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end border-t border-[var(--border)] pt-6">
          <Link
            href={`/models/${projectId}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            <ArrowLeft className="h-4 w-4" />

            Return to Editor
          </Link>
        </div>
      </section>
    </main>
  );
}