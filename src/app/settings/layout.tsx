import type { ReactNode } from "react";

import { ProfileShell } from "@/components/profile/ProfileShell";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <ProfileShell>{children}</ProfileShell>;
}
