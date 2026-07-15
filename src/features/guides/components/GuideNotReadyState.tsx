import { ArrowLeft, CircleAlert } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 py-12 text-white">
      <section className="w-full max-w-2xl rounded-3xl border border-orange-400/15 bg-orange-400/[0.035] p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10">
          <CircleAlert className="h-5 w-5 text-orange-300" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold">
          This guide is not ready yet
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Complete the remaining project checks before opening the painting guide.
        </p>

        <ul className="mt-6 space-y-3">
          {incompleteChecks.map((check) => (
            <li
              key={check.id}
              className="rounded-2xl border border-white/10 bg-neutral-950/50 p-4"
            >
              <p className="text-sm font-medium text-white">
                {check.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {check.description}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href={`/models/${projectId}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-orange-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-orange-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Editor
        </Link>
      </section>
    </main>
  );
}
