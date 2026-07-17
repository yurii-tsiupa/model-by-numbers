import { StyleSheet } from "@react-pdf/renderer";
import { PDF_PAGE_POINTS } from "./printPageConstants";

export const pdfColors = {
  accent: "#f97316",
  accentLight: "#fff7ed",
  background: "#ffffff",
  surface: "#f5f5f5",
  border: "#e5e5e5",
  text: "#171717",
  muted: "#737373",
};

export const guidePdfStyles = StyleSheet.create({
  page: {
    backgroundColor: pdfColors.background,
    color: pdfColors.text,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: PDF_PAGE_POINTS.marginTop,
    paddingRight: PDF_PAGE_POINTS.marginRight,
    paddingBottom: PDF_PAGE_POINTS.marginBottom,
    paddingLeft: PDF_PAGE_POINTS.marginLeft,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 14,
  },
  eyebrow: {
    color: pdfColors.accent,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionDescription: {
    color: pdfColors.muted,
    fontSize: 10,
    marginBottom: 26,
  },
  card: {
    backgroundColor: pdfColors.surface,
    borderColor: pdfColors.border,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    padding: 16,
  },
  label: {
    color: pdfColors.muted,
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    fontWeight: 700,
  },
  footer: {
    bottom: 24,
    color: pdfColors.muted,
    fontSize: 8,
    left: 42,
    position: "absolute",
    right: 42,
    textAlign: "center",
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: pdfColors.surface,
    borderColor: pdfColors.border,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    color: pdfColors.muted,
    justifyContent: "center",
  },
});
