import Link from "next/link";
import { Box, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="w-full max-w-3xl">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Box className="h-6 w-6 text-orange-400" />
        </div>

        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
          Model by Numbers
        </p>

        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Create painting guides for physical 3D models.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg">
          Upload a 3D model, organize its parts, assign colors and generate a
          clear painting guide.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-neutral-950 transition hover:bg-neutral-200"
          >
            Continue with Google
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-white/10 px-6 py-3 font-medium text-neutral-500"
          >
            View demo
          </button>
        </div>
      </section>
    </main>
  );
}