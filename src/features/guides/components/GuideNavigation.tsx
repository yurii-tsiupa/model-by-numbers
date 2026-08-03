"use client";

import { ChevronDown, Layers3 } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { formatCount, translate } from "@/features/i18n/lib/i18n";
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
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  const resolvedActiveId = sections.some((section) => section.id === activeId)
    ? activeId
    : sections[0]?.id;
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === resolvedActiveId));
  const activeSection = sections[activeIndex];
  const progress = sections.length ? ((activeIndex + 1) / sections.length) * 100 : 0;

  useEffect(() => {
    const sectionIds = new Set(sections.map((section) => section.id));
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-guide-section]"))
      .filter((element) => sectionIds.has(element.dataset.guideSection as GuideSectionId));

    if (!elements.length) {
      return;
    }

    const intersectionRatios = new Map<Element, number>();
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
            entry.target,
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
            elements.some((element) => element.dataset.guideSection === navigationTarget && (intersectionRatios.get(element) ?? 0) > 0)
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
              intersectionRatios.get(element) ?? 0,
          }))
          .filter((item) => item.ratio > 0)
          .sort((a, b) => b.ratio - a.ratio)[0];

        if (visibleSection) {
          setActiveId(
            visibleSection.element.dataset.guideSection as GuideSectionId,
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
    <ol className="space-y-1.5">
      {sections.map((section, index) => {
        const isActive = resolvedActiveId === section.id;

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
                min-h-12
                items-center
                gap-3
                rounded-xl
                px-2
                py-2
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--accent)]
                ${
                  isActive
                    ? "bg-[var(--accent-soft)] font-semibold text-[var(--text)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
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
                  font-[family-name:var(--font-mono)]
                  text-[10px]
                  font-semibold
                  transition-colors
                  ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                  }
                `}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 break-words font-[family-name:var(--font-body)] text-sm leading-5">
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
        className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-[var(--text)] 2xl:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <Layers3
                className="h-4 w-4 text-[var(--accent)]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <span className="block font-[family-name:var(--font-body)] text-sm font-semibold">
                {t("guide.navigation.contents")}
              </span>

              <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">
                {formatCount(locale, sections.length, "section")}
              </span>
            </div>
          </div>

          <ChevronDown
            className="h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform group-open:rotate-180"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </summary>

        <div className="mt-4">{links}</div>
      </details>

      <nav
        data-guide-navigation
        aria-label={t("guide.navigation.label")}
        className="guide-side-panel sticky top-20 col-start-1 row-start-1 hidden max-h-[calc(100vh-6rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--text)] 2xl:flex"
      >
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
            <Layers3
              className="h-[18px] w-[18px] text-[var(--accent)]"
              strokeWidth={1.8}
              aria-hidden="true"
            />

          </div>

          <div className="min-w-0">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[-0.01em]">
              {t("guide.navigation.contents")}
            </h2>

            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {formatCount(locale, sections.length, "section")}
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-[var(--border)]" />

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{links}</div>

        {activeSection ? <div className="mt-4 shrink-0 border-t border-[var(--border)] pt-4">
          <div className="h-1 overflow-hidden rounded-full bg-[var(--surface)]" aria-hidden="true">
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-out"
              style={{
                width: `${progress}%`,
                backgroundImage: "linear-gradient(90deg, var(--accent), var(--accent-2))",
              }}
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
            {t("guide.navigation.progress", { current: activeIndex + 1, total: sections.length, title: t(activeSection.titleKey) })}
          </p>
        </div> : null}
      </nav>
    </>
  );
}
