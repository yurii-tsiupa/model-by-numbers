import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Box className="h-5 w-5 text-orange-400" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-3 leading-6 text-neutral-400">
            Sign in to manage your models and painting guides.
          </p>

          <button
            type="button"
            disabled
            className="mt-8 flex w-full cursor-not-allowed items-center justify-center rounded-full bg-white px-5 py-3 font-medium text-neutral-950 opacity-70"
          >
            Continue with Google
          </button>

          <p className="mt-4 text-center text-xs text-neutral-600">
            Google authentication will be connected next.
          </p>
        </div>
      </div>
    </main>
  );
}