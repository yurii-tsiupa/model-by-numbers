import type { Locale } from "@/features/i18n/types/Locale";
import { translate } from "@/features/i18n/lib/i18n";
import type { ExportValidationWarning } from "../services/pdf/validateGuideExport";
import { getGuideExportWarningTranslationKey } from "../services/pdf/validateGuideExport";

type Props={locale:Locale;warnings:ExportValidationWarning[];onConfirm:()=>void;onReview:()=>void};

export function GuideExportWarningDialog({locale,warnings,onConfirm,onReview}:Props) {
  const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  return <div role="dialog" aria-modal="true" aria-labelledby="guide-export-warning-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5">
    <div className="w-full max-w-lg rounded-2xl border border-amber-400/20 bg-neutral-900 p-6 shadow-2xl">
      <h2 id="guide-export-warning-title" className="text-xl font-semibold text-white">{t("guide.pdfExport.warningTitle",{count:warnings.length})}</h2>
      <p className="mt-2 text-sm text-neutral-400">{t("guide.pdfExport.warningDescription")}</p>
      <ul className="mt-5 space-y-2 text-sm text-amber-200">{warnings.map(warning=><li key={warning.code} className="rounded-xl border border-amber-400/10 bg-amber-400/[.05] px-3 py-2">{t(getGuideExportWarningTranslationKey(warning.code),{count:warning.count??1})}</li>)}</ul>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onReview} className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/[.05]">{t("guide.pdfExport.reviewGuide")}</button><button type="button" onClick={onConfirm} className="rounded-full bg-orange-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-orange-300">{t("guide.pdfExport.exportAnyway")}</button></div>
    </div>
  </div>;
}
