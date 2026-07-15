import { ArrowLeft, Box, Download } from "lucide-react";
import Link from "next/link";

type GuidePreviewHeaderProps = {
  projectId: string;
  title: string;
};

export function GuidePreviewHeader({
  projectId,
  title,
}: GuidePreviewHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10">
            <Box className="h-5 w-5 text-orange-400" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              Model by Numbers
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Painting Guide Preview
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/models/${projectId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Link>

          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-orange-400/10 px-4 py-2.5 text-sm font-medium text-orange-300/50"
          >
            <Download className="h-4 w-4" />
            PDF coming next
          </button>
        </div>
      </div>
    </header>
  );
}
