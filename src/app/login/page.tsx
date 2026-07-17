"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Container } from "@/components/ui/Container";
import { Loader } from "@/components/ui/Loader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

function LayerBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 900 900"
        fill="none"
        className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-[900px] sm:w-[900px]"
      >
        <path
          d="M451 123C565 119 675 168 741 260C810 356 821 483 770 589C720 693 610 764 493 778C375 792 250 747 179 652C108 557 93 426 137 316C181 205 301 128 451 123Z"
          stroke="var(--border)"
          strokeWidth="1"
        />

        <path
          d="M452 168C550 164 643 205 699 283C758 365 768 472 725 562C681 651 588 711 488 722C387 734 281 696 220 615C160 534 148 423 186 329C224 235 326 172 452 168Z"
          stroke="var(--border)"
          strokeWidth="1"
        />

        <path
          d="M454 217C533 213 609 247 654 309C702 374 710 460 676 532C641 603 566 651 485 660C404 669 319 639 270 573C221 508 212 419 243 343C274 268 354 220 454 217Z"
          stroke="var(--border)"
          strokeWidth="1"
        />

        <path
          d="M456 270C518 267 577 293 612 341C649 392 655 458 628 514C601 570 542 607 480 614C417 621 351 598 313 547C275 496 268 428 292 369C316 310 378 272 456 270Z"
          stroke="var(--border)"
          strokeWidth="1"
        />

        <path
          d="M457 326C501 324 543 342 568 376C595 412 599 459 580 499C561 539 519 565 475 570C430 575 383 559 356 523C329 487 324 438 341 396C358 354 402 328 457 326Z"
          stroke="var(--border)"
          strokeWidth="1"
        />

        <path
          d="M458 382C484 381 508 392 523 412C538 433 541 460 530 483C519 506 495 521 469 524C443 527 415 517 399 496C384 475 381 447 391 422C401 398 427 383 458 382Z"
          stroke="var(--accent)"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bg)] opacity-40 blur-3xl" />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/models");
    }
  }, [isLoading, router, user]);

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-[var(--text)]">
        <Loader label={t("auth.checking")} />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <header className="relative z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
        <Container className="flex min-h-16 items-center justify-between gap-6 sm:min-h-[72px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-[var(--font-heading)] text-xl font-semibold"
            aria-label="Шар — головна"
          >
            <span
              className="grid size-9 place-items-center rounded-[10px] bg-[var(--accent)] text-sm font-semibold text-white"
              aria-hidden="true"
            >
              Ш
            </span>

            <span className="hidden min-[380px]:inline">Шар</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <section className="relative flex flex-1 items-center justify-center">
        <LayerBackground />

        <Container className="relative z-10 flex justify-center py-12 sm:py-20">
          <div className="w-full max-w-[420px]">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            >
              <ArrowLeft className="size-4" />
              {t("auth.back")}
            </Link>

            <div className="rounded-[24px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_94%,transparent)] p-6 backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="mb-3 font-[var(--font-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent)]">
                  Шар за шаром
                </p>

                <h1 className="font-[var(--font-heading)] text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  {t("auth.welcome")}
                </h1>

                <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                  {t("auth.description")}
                </p>
              </div>

              <GoogleSignInButton />

              <p className="mt-6 text-center text-xs leading-5 text-[var(--text-secondary)]">
                {t("auth.terms")}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}