import type { ReactNode } from "react";
import { AppHeader, type AppHeaderProps } from "./AppHeader";

export function AppShell({ children, contentMode = "standard", ...header }: AppHeaderProps & { children: ReactNode; contentMode?: "standard" | "fullHeight" | "document" }) {
  return <div className={`flex min-h-screen w-full min-w-0 flex-col bg-[var(--bg)] text-[var(--text)] ${contentMode === "fullHeight" ? "h-dvh overflow-hidden" : ""}`}><AppHeader {...header}/><div className={`w-full min-w-0 ${contentMode === "fullHeight" ? "min-h-0 flex-1" : "flex-1"}`}>{children}</div></div>;
}
