import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";

import type { GuidePart } from "../types/ModelGuide";

type GuidePartsSectionProps = {
  parts: GuidePart[];
  locale: Locale;
};

function formatColorNumber(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function GuidePartsSection({
  parts,
  locale,
}: GuidePartsSectionProps) {
  const t = (
    key: Parameters<typeof translate>[1],
  ) => translate(locale, key);

  return (
    <section className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#76558F]" />

        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#76558F]">
          {t("guide.stepReference")}
        </p>
      </div>

      <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-[-0.04em] text-[#181221]">
        {t("guide.parts")}
      </h2>

      <p className="mt-3 max-w-3xl font-[family-name:var(--font-inter)] text-sm leading-6 text-[#716A79]">
        {t("guide.partsDescription")}
      </p>

      {/* Mobile */}

      <div className="mt-8 grid gap-3 sm:hidden">
        {parts.map((part) => {
          const assigned =
            part.colorNumber !== null &&
            part.colorName !== null &&
            part.colorHex !== null;

          return (
            <article
              key={part.id}
              className="rounded-2xl border border-[#E3DEEC] bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D6CAE0] bg-[#F7F3FA] font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-[#76558F]">
                  {part.number}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-inter)] text-sm font-semibold text-[#181221]">
                    {part.name}
                  </p>

                  <p className="mt-1 text-xs text-[#716A79]">
                    {assigned
                      ? `${formatColorNumber(
                          part.colorNumber ?? 0,
                        )} · ${part.colorName}`
                      : t("common.unassigned")}
                  </p>
                </div>

                {assigned ? (
                  <span
                    className="h-9 w-9 rounded-xl border border-[#D5CFDD]"
                    style={{
                      backgroundColor:
                        part.colorHex ?? undefined,
                    }}
                  />
                ) : (
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#AAA2B1]">
                    —
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop */}

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-[#E3DEEC] bg-white sm:block">
        <table className="w-full min-w-[42rem] border-collapse">
          <thead className="border-b border-[#E3DEEC] bg-[#FAF9FC]">
            <tr>
              <th className="px-5 py-4 text-left font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8291]">
                #
              </th>

              <th className="px-5 py-4 text-left font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8291]">
                {t("guide.parts")}
              </th>

              <th className="px-5 py-4 text-left font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8291]">
                {t("guide.palette")}
              </th>

              <th className="px-5 py-4 text-left font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8291]">
                {t("guide.paintReference")}
              </th>

              <th
                className="px-5 py-4 text-left font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8291]"
                aria-label={t("guide.baseColor")}
              />
            </tr>
          </thead>

          <tbody>
            {parts.map((part, index) => {
              const assigned =
                part.colorNumber !== null &&
                part.colorName !== null &&
                part.colorHex !== null;

              return (
                <tr
                  key={part.id}
                  className={`border-b border-[#E3DEEC] last:border-b-0 ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-[#FCFBFD]"
                  }`}
                >
                  <td className="px-5 py-4 font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-[#76558F]">
                    {part.number}
                  </td>

                  <td className="px-5 py-4 font-[family-name:var(--font-inter)] text-sm font-medium text-[#181221]">
                    {part.name}
                  </td>

                  <td className="px-5 py-4 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#5F5866]">
                    {assigned
                      ? formatColorNumber(
                          part.colorNumber!,
                        )
                      : t("common.unassigned")}
                  </td>

                  <td className="px-5 py-4 font-[family-name:var(--font-inter)] text-sm text-[#5F5866]">
                    {assigned
                      ? part.colorName
                      : t("common.unassigned")}
                  </td>

                  <td className="px-5 py-4">
                    {assigned ? (
                      <span
                        className="block h-7 w-7 rounded-lg border border-[#D5CFDD]"
                        style={{
                          backgroundColor:
                            part.colorHex!,
                        }}
                      />
                    ) : (
                      <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#AAA2B1]">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}