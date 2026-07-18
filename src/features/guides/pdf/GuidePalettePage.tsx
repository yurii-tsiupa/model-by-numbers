import {
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ModelGuide } from "../types/ModelGuide";
import { GuidePageFooter } from "./GuidePageFooter";
import { GuidePageHeader } from "./GuidePageHeader";
import {
  guidePdfStyles,
  pdfColors,
} from "./guidePdfStyles";
import { translate } from "@/features/i18n/lib/i18n";

type GuidePalettePageProps = {
  guide: ModelGuide;
};

const COLORS_PER_PAGE = 12;

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    alignItems: "center",
    backgroundColor: pdfColors.surface,
    borderColor: pdfColors.border,
    borderRadius: 7,
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    padding: 9,
  },
  swatch: {
    borderColor: "#d4d4d4",
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    height: 30,
    marginRight: 11,
    width: 30,
  },
  number: {
    color: pdfColors.accent,
    fontSize: 10,
    fontWeight: 700,
    width: 44,
  },
  name: {
    flexGrow: 1,
    fontSize: 10,
    fontWeight: 700,
  },
  hex: {
    color: pdfColors.muted,
    fontSize: 9,
    width: 70,
  },
  usage: {
    color: pdfColors.muted,
    fontSize: 9,
    textAlign: "right",
    width: 55,
  },
});

function formatColorNumber(number: number): string {
  return `C${String(number).padStart(2, "0")}`;
}

export function GuidePalettePage({
  guide,
}: GuidePalettePageProps) {
  const locale=guide.locale??"en";const t=(key:Parameters<typeof translate>[1],values?:Parameters<typeof translate>[2])=>translate(locale,key,values);
  const pageCount = Math.max(
    1,
    Math.ceil(guide.palette.length / COLORS_PER_PAGE),
  );

  return (
    <>
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <Page
          key={pageIndex}
          id={pageIndex===0?"palette":undefined}
          size="A4"
          orientation="portrait"
          style={guidePdfStyles.page}
        >
          <GuidePageHeader projectName={guide.title}/>
          <Text style={guidePdfStyles.eyebrow}>{t("guide.paintReference")}</Text>
          <Text style={guidePdfStyles.pageTitle}>
            {t("guide.palette")}{pageIndex > 0 ? ` (${t("guide.continued")})` : ""}
          </Text>
          <Text style={guidePdfStyles.sectionDescription}>
            {t("pdf.paletteHelp",{count:guide.colorsCount})}
          </Text>

          <View style={styles.list}>
            {guide.palette
              .slice(
                pageIndex * COLORS_PER_PAGE,
                (pageIndex + 1) * COLORS_PER_PAGE,
              )
              .map((color) => (
                <View key={color.id} style={styles.row}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: color.hex },
                    ]}
                  />
                  <Text style={styles.number}>
                    {formatColorNumber(color.number)}
                  </Text>
                  <Text style={styles.name}>{color.name}</Text>
                  <Text style={styles.hex}>{color.hex.toUpperCase()}</Text>
                  <Text style={styles.usage}>
                    {t("guide.usedBy",{count:color.usageCount})}
                  </Text>
                </View>
              ))}
          </View>
          <GuidePageFooter locale={locale}/>
        </Page>
      ))}
    </>
  );
}
