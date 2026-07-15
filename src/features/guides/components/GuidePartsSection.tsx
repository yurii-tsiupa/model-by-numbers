import type { GuidePart } from "../types/ModelGuide";

type GuidePartsSectionProps = {
  parts: GuidePart[];
};

function formatColorNumber(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function GuidePartsSection({
  parts,
}: GuidePartsSectionProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
        Step reference
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        Parts
      </h2>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-5 py-4 font-medium">Number</th>
              <th className="px-5 py-4 font-medium">Part</th>
              <th className="px-5 py-4 font-medium">Color</th>
              <th className="px-5 py-4 font-medium">Color name</th>
              <th className="px-5 py-4 font-medium">Swatch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {parts.map((part) => {
              const isAssigned =
                part.colorNumber !== null &&
                part.colorName !== null &&
                part.colorHex !== null;

              return (
                <tr key={part.id} className="bg-white/[0.015]">
                  <td className="px-5 py-4 font-mono text-orange-300">
                    {part.number}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">
                    {part.name}
                  </td>
                  <td className="px-5 py-4 font-mono text-neutral-300">
                    {isAssigned
                      ? formatColorNumber(part.colorNumber!)
                      : "Unassigned"}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">
                    {isAssigned ? part.colorName : "Unassigned"}
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
