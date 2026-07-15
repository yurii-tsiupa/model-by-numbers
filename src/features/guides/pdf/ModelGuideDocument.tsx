import {
  Document,
  Font,
} from "@react-pdf/renderer";

import type { ModelGuide } from "../types/ModelGuide";
import { GuideCoverPage } from "./GuideCoverPage";
import { GuideModelViewsPage } from "./GuideModelViewsPage";
import { GuidePalettePage } from "./GuidePalettePage";
import { GuidePartsPage } from "./GuidePartsPage";
import { GuideProjectPage } from "./GuideProjectPage";
import { GuideReferencesPage } from "./GuideReferencesPage";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/fonts/roboto-cyrillic-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "/fonts/roboto-cyrillic-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

export type ModelGuideDocumentProps = {
  guide: ModelGuide;
};

export function ModelGuideDocument({
  guide,
}: ModelGuideDocumentProps) {
  return (
    <Document
      title={`${guide.title} Painting Guide`}
      author={guide.author}
      creator="Model by Numbers"
    >
      <GuideCoverPage guide={guide} />
      <GuideProjectPage guide={guide} />
      <GuideModelViewsPage guide={guide} />
      {(guide.references?.length ?? 0)>0?<GuideReferencesPage references={guide.references??[]}/>:null}
      <GuidePalettePage guide={guide} />
      <GuidePartsPage guide={guide} />
    </Document>
  );
}
