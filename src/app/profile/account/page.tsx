"use client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
export default function ProfileAccountPage(){const{user}=useAuth();const{t}=useTranslation();if(!user)return null;const provider=user.providerData.some(item=>item.providerId==="google.com")?t("profile.providers.google"):t("profile.providers.password");return <><ProfileSectionHeader title={t("profile.account.title")} description={t("profile.account.description")}/><section className="mt-6 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><h2 className="text-base font-semibold">{t("profile.account.information")}</h2>{user.email?<p className="mt-3 text-sm text-[var(--text)]">{user.email}</p>:null}<p className="mt-1 text-xs text-[var(--text-secondary)]">{t("profile.overview.signedInWith",{provider})}</p><div className="mt-5 border-t border-[var(--border)] pt-3"><SignOutButton/></div></section></>}
