"use client";

import { ChevronDown, Layers3 } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type {
  GuideSectionId,
  GuideSectionMetadata,
} from "../lib/getGuideViewModel";

type GuideNavigationProps = {
  sections: readonly GuideSectionMetadata[];
  locale: Locale;
};

export function GuideNavigation({
  sections,
  locale,
}: GuideNavigationProps) {
  const [activeId, setActiveId] = useState<
    GuideSectionId | undefined
  >(sections[0]?.id);

  const navigationTargetRef = useRef<GuideSectionId | null>(
    null,
  );

  const navigationTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const t = (
    key: Parameters<typeof translate>[1],
  ) => translate(locale, key);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter(
        (element): element is HTMLElement =>
          Boolean(element),
      );

    if (!elements.length) {
      return;
    }

    const intersectionRatios = new Map<string, number>();
    const lastSectionId = sections.at(-1)?.id;

    let animationFrame: number | null = null;

    const isAtPageBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;

    const activateLastSectionAtBottom = () => {
      if (!lastSectionId || !isAtPageBottom()) {
        return false;
      }

      navigationTargetRef.current = null;
      setActiveId(lastSectionId);

      return true;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersectionRatios.set(
            entry.target.id,
            entry.isIntersecting
              ? entry.intersectionRatio
              : 0,
          );
        }

        if (activateLastSectionAtBottom()) {
          return;
        }

        const navigationTarget =
          navigationTargetRef.current;

        if (navigationTarget) {
          if (
            (intersectionRatios.get(navigationTarget) ??
              0) > 0
          ) {
            navigationTargetRef.current = null;
            setActiveId(navigationTarget);
          }

          return;
        }

        const visibleSection = elements
          .map((element) => ({
            element,
            ratio:
              intersectionRatios.get(element.id) ?? 0,
          }))
          .filter((item) => item.ratio > 0)
          .sort((a, b) => b.ratio - a.ratio)[0];

        if (visibleSection) {
          setActiveId(
            visibleSection.element.id as GuideSectionId,
          );
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    const handleScroll = () => {
      if (animationFrame !== null) {
        return;
      }

      animationFrame = window.requestAnimationFrame(
        () => {
          animationFrame = null;
          activateLastSectionAtBottom();
        },
      );
    };

    elements.forEach((element) => {
      observer.observe(element);
    });

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    activateLastSectionAtBottom();

    return () => {
      observer.disconnect();

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [sections]);

  useEffect(
    () => () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    },
    [],
  );

  function navigate(id: GuideSectionId) {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    navigationTargetRef.current = id;

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      navigationTargetRef.current = null;
    }, 1500);

    window.history.replaceState(null, "", `#${id}`);

    target.focus({
      preventScroll: true,
    });

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setActiveId(id);
  }

  const links = (
    <ol className="mt-4 space-y-1">
      {sections.map((section, index) => {
        const isActive = activeId === section.id;

        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={
                isActive ? "location" : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                navigate(section.id);
              }}
              className={`
                group/link
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--accent)]
                ${
                  isActive
                    ? "bg-[var(--bg)] text-[var(--text)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                }
              `}
            >
              <span
                className={`
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  font-[family-name:var(--font-jetbrains-mono)]
                  text-[10px]
                  font-semibold
                  transition-colors
                  ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--card)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)]"
                  }
                `}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 font-[family-name:var(--font-inter)] text-sm font-medium leading-5">
                {t(section.titleKey)}
              </span>

              {isActive ? (
                <span
                  aria-hidden="true"
                  className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                />
              ) : null}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details
        data-guide-navigation
        className="group mx-5 mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--text)] sm:mx-6 lg:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <Layers3
                className="h-4 w-4 text-[var(--accent)]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <span className="block font-[family-name:var(--font-space-grotesk)] text-sm font-semibold">
                {t("guide.navigation.contents")}
              </span>

              <span className="mt-0.5 block font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {sections.length} sections
              </span>
            </div>
          </div>

          <ChevronDown
            className="h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform group-open:rotate-180"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </summary>

        {links}
      </details>

      <nav
        data-guide-navigation
        aria-label={t("guide.navigation.label")}
        className="sticky top-6 hidden max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--text)] lg:block"
      >
        <div className="flex items-center gap-3 px-1">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <Layers3
              className="h-[18px] w-[18px] text-[var(--accent)]"
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-2 right-2 h-1 rounded-full bg-[var(--accent)] opacity-30"
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[-0.01em]">
              {t("guide.navigation.contents")}
            </h2>

            <p className="mt-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {sections.length} sections
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-[var(--border)]" />

        {links}
      </nav>
    </>
  );
}