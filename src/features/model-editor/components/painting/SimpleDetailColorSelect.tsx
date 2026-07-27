"use client";
import { Check } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import type { PaletteColor } from "@/features/models/types/PaletteColor";

export function SimpleDetailColorSelect({value,colors,onChange,disabled=false,label}:{value:string|null;colors:readonly PaletteColor[];onChange:(id:string|null)=>void;disabled?:boolean;label?:string}) {
  const { t } = useTranslation();
  return <fieldset disabled={disabled} className="min-w-0">
    {label ? <legend className="mb-2 text-xs">{label}</legend> : null}
    {colors.length ? <div className="grid min-w-0 grid-cols-1 gap-1.5">
      {colors.map(color => {
        const selected = value === color.id;
        return <button key={color.id} type="button" aria-pressed={selected} onClick={() => onChange(color.id)} className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left ${selected ? "border-[var(--accent)] bg-[var(--bg)]" : "border-[var(--border)]"}`}>
          <span className="size-6 shrink-0 rounded-md border border-[var(--border)]" style={{backgroundColor:color.hex}} />
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{color.name}</span><span className="block truncate font-mono text-[10px] text-[var(--text-secondary)]">{color.hex}</span></span>
          {selected ? <Check className="size-4 shrink-0 text-[var(--accent)]" /> : null}
        </button>;
      })}
    </div> : <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-secondary)]">{t("editor.workflow.emptyPalette")}</p>}
  </fieldset>;
}
