import { translate } from "@/features/i18n/lib/i18n";
import type { Locale } from "@/features/i18n/types/Locale";
import type { ModelGuide } from "../types/ModelGuide";

export type PdfDocumentMetadata = {
  title: string;
  subject: string;
  author?: string;
  language: string;
  creationDate: Date;
};

export function createPdfDocumentMetadata(guide: ModelGuide, creationDate: Date): PdfDocumentMetadata {
  const locale: Locale = guide.locale ?? "en";
  return {
    title: guide.title,
    subject: translate(locale, "pdf.metadata.subject", { project: guide.title }),
    author: guide.author.trim() || undefined,
    language: locale === "uk" ? "uk-UA" : "en-US",
    creationDate,
  };
}
