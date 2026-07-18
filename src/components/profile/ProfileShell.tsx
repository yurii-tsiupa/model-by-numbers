import type { ReactNode } from "react";
import { ProtectedAppShell } from "@/components/layout/ProtectedAppShell";

export function ProfileShell({ children }: { children: ReactNode }) { return <ProtectedAppShell>{children}</ProtectedAppShell>; }
