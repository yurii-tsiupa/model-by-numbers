"use client";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { PaletteColor } from "@/features/models/types/PaletteColor";

export function SimpleDetailColorSelect({value,colors,onChange,disabled=false,label}:{value:string|null;colors:readonly PaletteColor[];onChange:(id:string|null)=>void;disabled?:boolean;label?:string}) {
  const { t } = useTranslation();
  return <fieldset disabled={disabled} className="min-w-0">
    {label ? <legend className="simple-editor-label mb-1.5 text-[10px] font-semibold uppercase tracking-wide">{label}</legend> : null}
    {colors.length ? <div className="simple-detail-color-list grid max-h-52 min-w-0 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
      {colors.map(color => {
        const selected = value === color.id;
        return <button key={color.id} type="button" aria-pressed={selected} onClick={() => onChange(color.id)} className="simple-palette-color-card flex min-h-[48px] min-w-0 cursor-pointer items-center gap-3 rounded-lg bg-[var(--card)] px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40">
          <span className="size-7 shrink-0 rounded-lg border border-black/15" style={{backgroundColor:color.hex}} />
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[var(--text)]">{color.name}</span><span className="simple-palette-muted mt-0.5 block truncate font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase">{color.hex}</span></span>
        </button>;
      })}
    </div> : <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-secondary)]">{t("editor.workflow.emptyPalette")}</p>}
  </fieldset>;
}
