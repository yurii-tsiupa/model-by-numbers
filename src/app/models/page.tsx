import Link from "next/link";
import { Box, LogOut, Upload } from "lucide-react";

export default function ModelsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Box className="h-4 w-4 text-orange-400" />
            </div>

            <span className="font-medium">Model by Numbers</span>
          </Link>

          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-2 text-sm text-neutral-500"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-400">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your models
            </h1>

            <p className="mt-2 text-neutral-400">
              Manage your 3D models and painting guides.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 opacity-60"
          >
            <Upload className="h-4 w-4" />
            Upload model
          </button>
        </div>

        <div className="flex min-h-[420px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Box className="h-6 w-6 text-neutral-400" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">No models yet</h2>

            <p className="mt-2 leading-6 text-neutral-400">
              Upload your first 3D model and create a clear painting guide
              for all of its parts.
            </p>

            <button
              type="button"
              disabled
              className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-neutral-500"
            >
              <Upload className="h-4 w-4" />
              Upload your first model
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}