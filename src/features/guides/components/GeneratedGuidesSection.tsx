"use client";

import { Download, ExternalLink, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useDeleteGeneratedGuide } from "../hooks/useDeleteGeneratedGuide";
import { useGeneratedGuides } from "../hooks/useGeneratedGuides";
import { downloadGuidePdf } from "../lib/downloadGuidePdf";
import { generateGuidePdf } from "../pdf/generateGuidePdf";
import type { GeneratedGuide } from "../types/GeneratedGuide";

export function GeneratedGuidesSection({ projectId }: { projectId: string }) {
  const query = useGeneratedGuides(projectId);
  const deletion = useDeleteGeneratedGuide(projectId);
  const [selected, setSelected] = useState<GeneratedGuide | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function download(guide: GeneratedGuide) {
    setActionError(null);
    try { downloadGuidePdf(guide.pdfBlob ?? await generateGuidePdf(guide.snapshot), guide.fileName); }
    catch { setActionError("We could not download this PDF. Please try again."); }
  }

  return (
    <section className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-orange-400" /><h3 className="text-sm font-semibold text-white">Generated Guides</h3></div>
      <p className="mt-2 text-xs leading-5 text-neutral-500">Guides are currently stored only in this browser. Cloud sync will be added later.</p>
      {query.isError ? <p className="mt-3 text-xs text-red-300">Saved guides are unavailable in this browser.</p> : null}
      {actionError ? <p className="mt-3 text-xs text-red-300">{actionError}</p> : null}
      <div className="mt-4 space-y-3">
        {query.isLoading ? <p className="text-xs text-neutral-500">Loading saved guides...</p> : null}
        {query.data?.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-3"><p className="text-sm text-neutral-300">No generated guides yet.</p><p className="mt-1 text-xs leading-5 text-neutral-600">Generate and download a painting guide to create the first saved version.</p></div> : null}
        {query.data?.map((guide) => (
          <article key={guide.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium text-white">Guide v{guide.version}</p><p className="mt-1 text-xs text-neutral-500">{guide.createdAt.getTime() ? guide.createdAt.toLocaleString() : "Date unavailable"}</p></div><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] uppercase text-emerald-300">{guide.status}</span></div>
            <p className="mt-2 truncate text-xs text-neutral-500">{guide.fileName}</p><p className="mt-1 text-xs text-neutral-600">{guide.snapshot.partsCount} parts · {guide.snapshot.colorsCount} colors</p>
            <div className="mt-3 flex gap-2"><Link aria-label={`Open Guide v${guide.version}`} href={`/models/${projectId}/guides/${guide.id}`} className="rounded-lg border border-white/10 p-2 text-neutral-400 hover:text-white"><ExternalLink className="h-3.5 w-3.5" /></Link><button aria-label={`Download Guide v${guide.version}`} onClick={() => void download(guide)} className="cursor-pointer rounded-lg border border-white/10 p-2 text-neutral-400 hover:text-white"><Download className="h-3.5 w-3.5" /></button><button aria-label={`Delete Guide v${guide.version}`} onClick={() => setSelected(guide)} className="cursor-pointer rounded-lg border border-red-400/10 p-2 text-red-400 hover:bg-red-400/10"><Trash2 className="h-3.5 w-3.5" /></button></div>
          </article>
        ))}
      </div>
      <ConfirmationModal isOpen={Boolean(selected)} title={`Delete Guide v${selected?.version ?? ""}?`} description="This locally saved guide and its PDF will be permanently removed from this browser." confirmLabel="Delete Guide" variant="danger" isLoading={deletion.isPending} onClose={() => setSelected(null)} onConfirm={() => { if (!selected) return; deletion.mutate(selected.id, { onSuccess: () => setSelected(null), onError: () => setActionError("We could not delete this guide. Please try again.") }); }} />
    </section>
  );
}
