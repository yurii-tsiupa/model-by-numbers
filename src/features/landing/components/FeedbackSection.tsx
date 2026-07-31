'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { Container } from '@/components/ui/Container';
import { useTranslation } from '@/features/i18n/hooks/useTranslation';
import type { TranslationKey } from '@/features/i18n/locales/en';
import { db } from '@/lib/firebase/client';

type Audience = 'selling' | 'stopped' | 'considering' | 'notInterested';
const options: Audience[] = ['selling', 'stopped', 'considering', 'notInterested'];
const controlClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus:border-[var(--accent)]';

export function FeedbackSection() {
  const { locale, t } = useTranslation();
  const [audience, setAudience] = useState<Audience | null>(null);
  const [context, setContext] = useState('');
  const [fit, setFit] = useState<number | null>(null);
  const [improvements, setImprovements] = useState('');
  const [pricing, setPricing] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const excluded = audience === 'notInterested';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!audience || (!excluded && (!context.trim() || fit === null))) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'landingFeedbackResponses'), {
        audience,
        context: context.trim(),
        methodFit: excluded ? null : fit,
        improvements: excluded ? null : improvements.trim(),
        pricing: excluded ? null : pricing.trim(),
        email: email.trim() || null,
        locale,
        source: 'landing-page',
        surveyVersion: 1,
        submittedAt: serverTimestamp(),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="feedback" className="scroll-mt-20 border-t border-[var(--border)] py-20 sm:py-24 lg:py-28 xl:py-32">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16 xl:gap-24">
          <div>
            <span className="font-[var(--font-mono)] text-xs font-semibold tracking-[0.1em] text-[var(--accent-2)]">{t('landing.feedback.eyebrow')}</span>
            <h2 className="mt-4 max-w-[720px] text-[clamp(38px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em]">{t('landing.feedback.title')}</h2>
            <p className="mt-6 max-w-[650px] text-base leading-[1.7] text-[var(--text-secondary)] sm:text-[18px]">{t('landing.feedback.description')}</p>
            <p className="mt-5 font-[var(--font-mono)] text-xs tracking-[0.06em] text-[var(--text-muted)]">{t('landing.feedback.time')}</p>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7 lg:p-9">
            {status === 'success' ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center" role="status">
                <span className="grid size-14 place-items-center rounded-full bg-[var(--accent-2-soft)] text-2xl text-[var(--accent-2)]" aria-hidden="true">✓</span>
                <h3 className="mt-5 text-2xl font-semibold">{t('landing.feedback.successTitle')}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{t('landing.feedback.successDescription')}</p>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={submit}>
                <fieldset>
                  <legend className="text-lg font-semibold">{t('landing.feedback.q1')}</legend>
                  <div className="mt-4 grid gap-2">
                    {options.map((option) => (
                      <label key={option} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--border-strong)] has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-soft)]">
                        <input type="radio" name="audience" value={option} checked={audience === option} onChange={() => { setAudience(option); setContext(''); setStatus('idle'); }} required className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--accent)]" />
                        <span className="text-sm leading-5">{t(`landing.feedback.option.${option}`)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {audience ? (
                  <Field label={t(`landing.feedback.context.${audience}` as TranslationKey)} note={excluded ? t('landing.feedback.optional') : undefined}>
                    <textarea value={context} onChange={(event) => setContext(event.target.value)} placeholder={t(`landing.feedback.placeholder.${audience}`)} rows={4} required={!excluded} className={`${controlClass} resize-y`} />
                  </Field>
                ) : null}

                {audience && !excluded ? (
                  <>
                    <fieldset>
                      <legend className="text-lg font-semibold">{t('landing.feedback.q2')}</legend>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">{t('landing.feedback.scaleHint')}</p>
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((number) => (
                          <label key={number} className="cursor-pointer rounded-xl border border-[var(--border)] py-3 text-center font-[var(--font-mono)] text-sm hover:border-[var(--border-strong)] has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent)] has-[:checked]:text-[var(--accent-foreground)]">
                            <input type="radio" name="fit" value={number} checked={fit === number} onChange={() => setFit(number)} required className="sr-only" />
                            {number}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <Field label={t('landing.feedback.q3')}><textarea value={improvements} onChange={(event) => setImprovements(event.target.value)} placeholder={t('landing.feedback.placeholder.improvements')} rows={4} className={`${controlClass} resize-y`} /></Field>
                    <Field label={t('landing.feedback.q4')}><textarea value={pricing} onChange={(event) => setPricing(event.target.value)} placeholder={t('landing.feedback.placeholder.pricing')} rows={4} className={`${controlClass} resize-y`} /></Field>
                  </>
                ) : null}

                {audience ? (
                  <>
                    <Field label={t('landing.feedback.email')} note={t('landing.feedback.optional')}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('landing.feedback.placeholder.email')} className={controlClass} /></Field>
                    <div>
                      {status === 'error' ? <p role="alert" className="mb-3 text-sm text-[var(--danger)]">{t('landing.feedback.error')}</p> : null}
                      <button type="submit" disabled={status === 'submitting'} className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[var(--accent)] px-6 text-[15px] font-medium text-[var(--accent-foreground)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                        {status === 'submitting' ? t('landing.feedback.submitting') : t('landing.feedback.submit')}
                      </button>
                      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">{t('landing.feedback.privacy')}</p>
                    </div>
                  </>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return <label className="block"><span className="text-lg font-semibold">{label}</span>{note ? <span className="ml-2 text-xs text-[var(--text-muted)]">{note}</span> : null}<span className="mt-3 block">{children}</span></label>;
}
