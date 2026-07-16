import type { GuidePart } from "../types/ModelGuide";
import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";

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
  const t=(key:Parameters<typeof translate>[1])=>translate(locale,key);
  return (
    <section className="scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
        {t("guide.stepReference")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {t("guide.parts")}
      </h2>

      <p className="mt-2 text-sm text-neutral-500">{t("guide.partsDescription")}</p>
      <div className="mt-8 grid gap-3 sm:hidden">{parts.map(part=>{const assigned=part.colorNumber!==null&&part.colorName!==null&&part.colorHex!==null;return <article key={part.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-400/10 font-mono text-sm font-bold text-orange-300">{part.number}</span><p className="min-w-0 flex-1 truncate font-medium text-white">{part.name}</p>{assigned?<span className="h-8 w-8 rounded-xl border border-white/20" style={{backgroundColor:part.colorHex??undefined}}/>:null}</div><p className="mt-3 pl-12 text-sm text-neutral-400">{assigned?`${formatColorNumber(part.colorNumber??0)} · ${part.colorName}`:t("common.unassigned")}</p></article>})}</div>
      <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-white/10 shadow-xl shadow-black/20 sm:block">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-neutral-900 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-5 py-4 font-medium">#</th>
              <th className="px-5 py-4 font-medium">{t("guide.parts")}</th>
              <th className="px-5 py-4 font-medium">{t("guide.palette")}</th>
              <th className="px-5 py-4 font-medium">{t("guide.paintReference")}</th>
              <th className="px-5 py-4 font-medium" aria-label={t("guide.baseColor")}/>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {parts.map((part) => {
              const isAssigned =
                part.colorNumber !== null &&
                part.colorName !== null &&
                part.colorHex !== null;

              return (
                <tr key={part.id} className="bg-white/[0.015] transition hover:bg-white/[0.035]">
                  <td className="px-5 py-4 font-mono text-orange-300">
                    {part.number}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">
                    {part.name}
                  </td>
                  <td className="px-5 py-4 font-mono text-neutral-300">
                    {isAssigned
                      ? formatColorNumber(part.colorNumber!)
                      : t("common.unassigned")}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">
                    {isAssigned ? part.colorName : t("common.unassigned")}
                  </td>
                  <td className="px-5 py-4">
                    {isAssigned ? (
                      <span
                        className="block h-7 w-7 rounded-lg border border-white/20"
                        style={{ backgroundColor: part.colorHex! }}
                      />
                    ) : (
                      <span className="text-neutral-600">—</span>
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
