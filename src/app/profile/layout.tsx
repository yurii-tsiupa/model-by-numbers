import type { ReactNode } from "react";
import { ProfileShell } from "@/components/profile/ProfileShell";

export default function ProfileLayout({children}:{children:ReactNode}){return <ProfileShell>{children}</ProfileShell>}
