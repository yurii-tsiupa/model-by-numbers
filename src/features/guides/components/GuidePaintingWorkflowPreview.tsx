"use client";

import {
  Brush,
  ChevronDown,
  CircleAlert,
  Droplets,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  SprayCan,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import Image from "next/image";

import {
  formatLocalizedDate,
  translate,
} from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";
import { formatPaintingTime } from "@/features/model-editor/lib/paintingWorkflow";
import { getPaintingStageLabel } from "@/features/model-editor/lib/paintingStageLabel";
import type { PaintingStageType } from "@/features/model-editor/types/PaintingWorkflow";

import type { ModelGuide } from "../types/ModelGuide";
import type {GuidePaintingStepViewModel} from "../types/GuidePaintingStep";
import { getGuideScreenshotLayout } from "../lib/getGuideScreenshotLayout";
import { ClassicEyebrow } from "../templates/classic/ClassicEyebrow";
import { defaultGuideDesignTokens as guideTokens } from "../design/guideDesignTokens";
import { classicPreviewInlineStyles } from "../templates/classic/classic.styles";

const ICONS: Record<
  PaintingStageType,
  typeof Paintbrush
> = {
  primer: SprayCan,
  "base-coat": Paintbrush,
  "secondary-color": Paintbrush,
  wash: Droplets,
  "dry-brush": Brush,
  highlight: Sparkles,
  finish: ShieldCheck,
  custom: Brush,
};

type GuidePaintingWorkflowPreviewProps = {
  guide: ModelGuide;
  locale: Locale;
  steps:readonly GuidePaintingStepViewModel[];
};

export function GuidePaintingWorkflowPreview({
  guide,
  locale,
  steps,
}: GuidePaintingWorkflowPreviewProps) {
  const t = (
    key: Parameters<typeof translate>[1],
    values?: Parameters<typeof translate>[2],
  ) => translate(locale, key, values);

  const [collapsed, setCollapsed] = useState<
    Set<string>
  >(() => new Set());

  const summary = guide.paintingSummary;
  const stepsById=useMemo(()=>new Map(steps.map(step=>[step.id,step])),[steps]);

  function togglePart(partId: string) {
    setCollapsed((current) => {
      const next = new Set(current);

      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }

      return next;
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-5 py-10 text-[#181221]">
      <section className="rounded-3xl border border-[#E3DEEC] bg-[#FAF9FC] p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <ClassicEyebrow>{t("guide.workflow.projectSummary")}</ClassicEyebrow>

            <h1 className="mt-3 break-words font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.035em] text-[#181221] sm:text-4xl">
              {guide.title}
            </h1>

            {summary?.modelName ? (
              <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-[#716A79]">
                {summary.modelName}
              </p>
            ) : null}
          </div>

          {summary ? (
            <span
              className={`
                inline-flex
                min-h-8
                shrink-0
                items-center
                rounded-full
                border
                px-3
                font-[family-name:var(--font-body)]
                text-xs
                font-semibold
                ${
                  summary.isReady
                    ? "border-[#B8DCC7] bg-[#EDF8F1] text-[#276342]"
                    : "border-[#E5D3A5] bg-[#FFF9E8] text-[#755B17]"
                }
              `}
            >
              {t(
                summary.isReady
                  ? "guide.workflow.ready"
                  : "guide.workflow.attention",
              )}
            </span>
          ) : null}
        </div>

        {summary ? (
          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Summary
              label={t("guide.workflow.created")}
              value={formatLocalizedDate(
                summary.createdAt,
                locale,
              )}
            />

            <Summary
              label={t("guide.workflow.parts")}
              value={String(guide.parts.length)}
            />

            <Summary
              label={t("guide.workflow.stages")}
              value={String(summary.stagesCount)}
            />

            <Summary
              label={t("guide.workflow.totalTime")}
              value={
                summary.estimatedTimeMinutes
                  ? formatPaintingTime(
                      summary.estimatedTimeMinutes,
                      locale,
                    )
                  : t("guide.workflow.notSpecified")
              }
            />

            <Summary
              label={t("guide.workflow.difficulty")}
              value={
                summary.difficulties.length
                  ? summary.difficulties
                      .map((difficulty) =>
                        t(
                          `painting.difficulty.${difficulty}`,
                        ),
                      )
                      .join(" · ")
                  : t("guide.workflow.notSpecified")
              }
            />
          </dl>
        ) : null}
      </section>

      <section>
        <SectionHeading
          index="01"
          title={t("guide.workflow.palette")}
        />

        {guide.workflowPalette?.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guide.workflowPalette.map((color) => (
              <article
                key={color.id}
                className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#E3DEEC] bg-white p-4"
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-xl border border-[#D5CFDD]"
                  style={{
                    backgroundColor: color.hex,
                  }}
                />

                <div className="min-w-0">
                  <h3 className="truncate font-[family-name:var(--font-display)] text-sm font-semibold text-[#181221]">
                    {color.name}
                  </h3>

                  <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-[#716A79]">
                    {color.hex}
                  </p>

                  <p className="mt-1 font-[family-name:var(--font-body)] text-xs text-[#716A79]">
                    {t("guide.workflow.colorUsage", {
                      count: color.usageCount,
                    })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>
            {t("guide.workflow.noColors")}
          </EmptyState>
        )}
      </section>

      <section>
        <ClassicEyebrow>{t("guide.paintingGuide")}</ClassicEyebrow>

        <h2
          className="break-words"
          style={{
            color: guideTokens.inkPrimary,
            fontFamily: guideTokens.headingFont,
            fontSize: guideTokens.sizeH1,
            fontWeight: guideTokens.weightBold,
            lineHeight: guideTokens.lineHeightHeading,
            marginTop: guideTokens.spacingSm,
          }}
        >
          {t("guide.workflow.instructions")}
        </h2>

        <p
          style={{
            color: guideTokens.inkMuted,
            fontFamily: guideTokens.bodyFont,
            fontSize: guideTokens.sizeBody,
            marginTop: guideTokens.spacingSm,
          }}
        >
          {steps.length} · {new Set(steps.flatMap((step) => step.color ? [step.color.number] : [])).size} · {summary?.estimatedTimeMinutes ? formatPaintingTime(summary.estimatedTimeMinutes, locale) : ""}
        </p>

        <div className="divide-y divide-[var(--border)]" style={{marginTop:guideTokens.spacingLg}}>
          {guide.parts.map((part, index) => {
            const workflow = part.paintingWorkflow;
            const isCollapsed = collapsed.has(part.id);

            return (
              <article
                key={part.id}
                className="bg-[var(--card)] py-6 first:pt-0 last:pb-0"
              >
                <header>
                  <div className="flex items-start gap-4">
                    <span className="pt-1 font-[family-name:var(--font-mono)] text-xs font-semibold text-[#76558F]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em] text-[#181221]">
                        {part.name}
                      </h3>

                      <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-[#716A79]">
                        {workflow?.stages.length
                          ? t(
                              "guide.workflow.stageCount",
                              {
                                count:
                                  workflow.stages
                                    .length,
                              },
                            )
                          : t(
                              "guide.workflow.noWorkflow",
                            )}

                        {workflow?.estimatedTimeMinutes
                          ? ` · ${formatPaintingTime(
                              workflow.estimatedTimeMinutes,
                              locale,
                            )}`
                          : ""}

                        {workflow?.difficulty
                          ? ` · ${t(
                              `painting.difficulty.${workflow.difficulty}`,
                            )}`
                          : ""}
                      </p>

                      {workflow?.paintBeforeAssembly ? (
                        <span className="mt-3 inline-flex min-h-7 items-center rounded-full border border-[#D6CAE0] bg-[#F7F3FA] px-2.5 font-[family-name:var(--font-body)] text-xs font-medium text-[#76558F]">
                          {t(
                            "guide.workflow.beforeAssembly",
                          )}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      aria-expanded={!isCollapsed}
                      aria-label={t(
                        isCollapsed
                          ? "guide.workflow.expand"
                          : "guide.workflow.collapse",
                        {
                          name: part.name,
                        },
                      )}
                      onClick={() => {
                        togglePart(part.id);
                      }}
                      className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E3DEEC] bg-[#FAF9FC] text-[#716A79] transition-colors hover:bg-[#F3F0F6] hover:text-[#181221] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76558F]"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isCollapsed
                            ? "-rotate-90"
                            : ""
                        }`}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </header>

                {!isCollapsed ? (
                  <div className="mt-5">
                    {workflow?.stages.length ? (
                      <div className="space-y-5">
                        {workflow.stages.map(
                          (stage) => {
                            const Icon =
                              ICONS[stage.type];

                            const step = stepsById.get(stage.id);
                            const color = step?.color ?? null;
                            const missingColor = step?.colorStatus === "missing";

                            return (
                              <section
                                key={stage.id}
                                className="flex break-inside-avoid-page gap-4 border-b border-[var(--border)] pb-5 last:border-b-0 last:pb-0"
                              >
                                <span className="pt-1 font-[family-name:var(--font-mono)] text-[10px] text-[#AAA2B1]">
                                  {String(
                                    stage.order,
                                  ).padStart(2, "0")}
                                </span>

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--card)]">
                                  <Icon
                                    className="h-4 w-4 text-[#76558F]"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8291]">
                                    {t(
                                      `painting.stageTypes.${stage.type}`,
                                    )}
                                  </p>

                                  <h4 className="mt-1 font-[family-name:var(--font-display)] text-base font-semibold text-[#181221]">
                                    {getPaintingStageLabel(
                                      stage,
                                      t,
                                    )}
                                  </h4>

                                  {color ? (
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <span
                                        className="h-6 w-6 rounded-lg border border-[#D5CFDD]"
                                        style={{
                                          backgroundColor:
                                            color.hex,
                                        }}
                                      />

                                      <span className="font-[family-name:var(--font-body)] text-sm text-[#716A79]">
                                        {color.name}
                                        {" · "}
                                        <span className="font-[family-name:var(--font-mono)] text-xs">
                                          C{String(color.number).padStart(2, "0")} · {color.hex.toUpperCase()}
                                        </span>
                                      </span>
                                    </div>
                                  ) : missingColor ? null : <div className="mt-3 flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-lg border border-dashed border-[#D5CFDD] bg-white text-xs text-[#8A8291]">—</span><span className="font-[family-name:var(--font-body)] text-sm text-[#716A79]">{t("painting.stage.noColor")}</span></div>}

                                  {missingColor ? (
                                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E5D3A5] bg-[#FFF9E8] px-2.5 py-1.5 font-[family-name:var(--font-body)] text-xs font-medium text-[#755B17]">
                                      <CircleAlert
                                        className="h-3.5 w-3.5"
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                      />

                                      {t(
                                        "guide.workflow.missingColor",
                                      )}
                                    </span>
                                  ) : null}

                                  {stage.recommendedCoats ? (
                                    <p className="mt-3 font-[family-name:var(--font-body)] text-sm text-[#716A79]">
                                      {t(
                                        "guide.workflow.coats",
                                        {
                                          count:
                                            stage.recommendedCoats,
                                        },
                                      )}
                                    </p>
                                  ) : null}

                                  {stage.notes ? (
                                    <p className="mt-3 whitespace-pre-wrap font-[family-name:var(--font-body)] text-sm leading-6 text-[#5F5866]">
                                      {stage.notes}
                                    </p>
                                  ) : null}

                                  {step ? <GuideStepPreview step={step}/> : null}
                                </div>
                              </section>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 rounded-xl border border-[#E5D3A5] bg-[#FFF9E8] p-3">
                        <CircleAlert
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#755B17]"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                        <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-[#755B17]">
                          {t(
                            "guide.workflow.noWorkflowAvailable",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function getMeaningfulPreviewLabel(label:string):string|null{
 const trimmed=label.trim();if(!trimmed)return null;const normalized=trimmed.toLocaleLowerCase();
 return normalized==="custom view"||normalized==="власний ракурс"||/^custom\s+\d+$/i.test(trimmed)?null:trimmed;
}

function getPreviewAspectRatio(width:number,height:number):number{
 return Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0?width/height:3/2;
}

function GuideStepPreview({step}:{step:GuidePaintingStepViewModel}){
 const ready=step.previews.filter(preview=>preview.status==="ready");
 const layout=getGuideScreenshotLayout(ready.length);
 const visible=ready.slice(0,layout.visibleCount);
 if(!visible.length)return null;
 return <div className="mt-4 break-inside-avoid">
  <p className="text-xs font-medium" style={{color:guideTokens.inkMuted}}>{step.targetSummary}</p>
  <div className="mt-3 flex flex-wrap justify-center gap-3">
   {visible.map((preview)=>{
    const caption=getMeaningfulPreviewLabel(preview.label);
    return preview.status==="ready"?<figure key={preview.id} style={{width:layout.columns===1?"68%":"48%"}}>
     <div style={{...classicPreviewInlineStyles.paintingPreviewFrame,aspectRatio:getPreviewAspectRatio(preview.image.width,preview.image.height)}}>
      <Image unoptimized fill sizes="(max-width: 640px) 68vw, 48vw" src={preview.image.src} alt={preview.alt} className="object-contain"/>
      {caption?<span className="absolute bottom-1.5 left-1.5 font-semibold" style={{backgroundColor:guideTokens.accentSoft,borderRadius:guideTokens.radiusPill,color:guideTokens.accentColor,fontFamily:guideTokens.bodyFont,fontSize:guideTokens.sizeCaption,padding:`${guideTokens.spacingXs}px ${guideTokens.spacingSm}px`}}>{caption}</span>:null}
     </div>
    </figure>:null;
   })}
  </div>
 </div>
}

type SummaryProps = {
  label: string;
  value: string;
};

function Summary({
  label,
  value,
}: SummaryProps) {
  return (
    <div className="rounded-xl border border-[#E3DEEC] bg-white p-3.5">
      <dt className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] text-[#8A8291]">
        {label}
      </dt>

      <dd className="mt-2 break-words font-[family-name:var(--font-body)] text-sm font-medium leading-5 text-[#312A37]">
        {value}
      </dd>
    </div>
  );
}

type SectionHeadingProps = {
  index: string;
  title: string;
};

function SectionHeading({
  index,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[#76558F]">
        {index}
      </span>

      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em] text-[#181221] sm:text-3xl">
        {title}
      </h2>

      <span
        aria-hidden="true"
        className="h-px min-w-8 flex-1 bg-[#E3DEEC]"
      />
    </div>
  );
}

type EmptyStateProps = {
  children: string;
};

function EmptyState({
  children,
}: EmptyStateProps) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#D5CFDD] bg-[#FAF9FC] px-5 py-6">
      <p className="font-[family-name:var(--font-body)] text-sm text-[#716A79]">
        {children}
      </p>
    </div>
  );
}
