"use client";

import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "@/features/i18n/hooks/useTranslation";

const EDITOR_ROUTE_PATTERN = /^\/models\/[^/]+\/?$/;
const MIN_SCROLL_DISTANCE = 500;
const VIEWPORT_SCROLL_THRESHOLD = 0.7;
const MIN_SCROLLABLE_VIEWPORTS = 1;
const VIEWPORT_EDGE_GAP = 16;

export function BackToTopButton() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(VIEWPORT_EDGE_GAP);
  const frameRef = useRef<number | null>(null);
  const isEditorRoute = EDITOR_ROUTE_PATTERN.test(pathname);

  const update = useCallback(() => {
    frameRef.current = null;
    if (isEditorRoute) {
      setVisible(false);
      return;
    }

    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollableHeight = documentHeight - viewportHeight;
    const isLongPage = scrollableHeight >= viewportHeight * MIN_SCROLLABLE_VIEWPORTS;
    const scrollThreshold = Math.max(MIN_SCROLL_DISTANCE, viewportHeight * VIEWPORT_SCROLL_THRESHOLD);
    setVisible(isLongPage && window.scrollY >= scrollThreshold);

    const footer = document.querySelector<HTMLElement>("[data-global-footer]");
    const footerTop = footer?.getBoundingClientRect().top ?? viewportHeight;
    const visibleFooterHeight = Math.max(0, viewportHeight - Math.max(0, footerTop));
    setBottomOffset(VIEWPORT_EDGE_GAP + visibleFooterHeight);
  }, [isEditorRoute]);

  const scheduleUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    scheduleUpdate();
    if (isEditorRoute) return;

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [isEditorRoute, scheduleUpdate]);

  if (isEditorRoute) return null;

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-hidden={!visible}
      aria-label={t("common.backToTop")}
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
      className={`fixed right-3 z-40 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium text-[var(--text-secondary)] shadow-[0_8px_24px_var(--shadow)] transition-[opacity,transform,color,background-color,border-color] duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] print:hidden sm:right-5 sm:h-10 sm:px-4 sm:text-sm ${visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      style={{ bottom: bottomOffset }}
    >
      <ArrowUp className="size-3.5 sm:size-4" aria-hidden="true" />
      <span>{t("common.backToTop")}</span>
    </button>
  );
}
