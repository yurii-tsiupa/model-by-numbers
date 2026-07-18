"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { normalizeAuthError } from "@/features/auth/services/auth-errors";
import { hasAuthFieldErrors, validateRegistration, type AuthFieldErrors } from "@/features/auth/services/auth-validation";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export default function RegisterPage() {
  const { t } = useTranslation(); const { registerWithEmail } = useAuth(); const router = useRouter();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState("");
  const [errors,setErrors]=useState<AuthFieldErrors>({}); const [formError,setFormError]=useState<string>(); const [submitting,setSubmitting]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();const next=validateRegistration(email,password,confirm);setErrors(next);if(hasAuthFieldErrors(next)||submitting)return;setSubmitting(true);setFormError(undefined);try{await registerWithEmail(email.trim(),password);router.replace("/models");}catch(error){setFormError(t(`auth.errors.${normalizeAuthError(error)}`));}finally{setSubmitting(false);}}
  const validation=(code:AuthFieldErrors[keyof AuthFieldErrors])=>code?t(`auth.validation.${code}`):undefined;
  return <AuthPageShell title={t("auth.register.title")} description={t("auth.register.description")}><form onSubmit={submit} noValidate className="mt-6 space-y-4"><AuthField id="register-email" label={t("auth.email")} type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} error={validation(errors.email)}/><AuthField id="register-password" label={t("auth.password")} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} error={validation(errors.password)}/><AuthField id="register-confirm" label={t("auth.confirmPassword")} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} error={validation(errors.confirmPassword)}/>{formError?<p role="alert" className="text-sm text-[var(--accent)]">{formError}</p>:null}<button disabled={submitting} className="h-11 w-full rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{submitting?t("auth.register.submitting"):t("auth.register.submit")}</button></form><div className="my-6 flex items-center gap-3 text-xs text-[var(--text-secondary)]"><span className="h-px flex-1 bg-[var(--border)]"/><span>{t("auth.or")}</span><span className="h-px flex-1 bg-[var(--border)]"/></div><GoogleSignInButton/><p className="mt-6 text-center text-sm text-[var(--text-secondary)]">{t("auth.register.hasAccount")} <Link href="/login" className="font-medium text-[var(--accent)]">{t("auth.register.login")}</Link></p></AuthPageShell>;
}
