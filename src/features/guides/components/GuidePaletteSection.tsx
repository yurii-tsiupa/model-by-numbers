import type { GuidePaletteColor } from "../types/ModelGuide";

type GuidePaletteSectionProps = {
  palette: GuidePaletteColor[];
};

function formatColorNumber(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function GuidePaletteSection({
  palette,
}: GuidePaletteSectionProps) {
  return (
    <section>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
          Paint reference
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Palette
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {palette.map((color) => (
          <article
            key={color.id}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
          >
            <span
              className="h-12 w-12 shrink-0 rounded-xl border border-white/20"
              style={{ backgroundColor: color.hex }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-sm font-semibold text-orange-300">
                  {formatColorNumber(color.number)}
                </p>
                <p className="text-xs text-neutral-600">
                  {color.usageCount} {color.usageCount === 1 ? "part" : "parts"}
                </p>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {color.name}
              </p>
              <p className="mt-0.5 font-mono text-xs text-neutral-500">
                {color.hex.toUpperCase()}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
